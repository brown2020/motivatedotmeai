import { NextResponse } from "next/server";
import { z } from "zod";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { requireSessionUserId } from "@/lib/require-session";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { aiInsightLimiter } from "@/lib/rate-limit";
import {
  buildGoalCoachPrompt,
  goalBelongsToUser,
  normalizeCoachGoal,
} from "@/lib/goal-coach";

const MAX_BODY_CHARS = 8_192;

const RequestSchema = z.object({
  goalId: z.string().trim().min(1).max(128),
});

export async function POST(req: Request) {
  try {
    const uid = await requireSessionUserId();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "AI not configured (missing OPENAI_API_KEY)." },
        { status: 501 }
      );
    }

    const raw = await req.text();
    if (raw.length > MAX_BODY_CHARS) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }

    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = RequestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (!aiInsightLimiter.allow(uid)) {
      return NextResponse.json(
        { error: "Too many coaching requests. Try again later." },
        { status: 429 }
      );
    }

    const snap = await getAdminFirestore().collection("goals").doc(parsed.data.goalId).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const data = snap.data() ?? {};
    if (!goalBelongsToUser(data.userId, uid)) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const goal = normalizeCoachGoal(data);
    if (!goal) {
      return NextResponse.json({ error: "Goal is missing required fields" }, { status: 400 });
    }

    const result = await streamText({
      model: openai("gpt-4o-mini"),
      system:
        "You are a pragmatic, encouraging coach for goal achievement. " +
        "You produce concise, structured guidance with clear next actions. " +
        "Never shame the user. Avoid generic advice. Be specific to the goal data.",
      prompt: buildGoalCoachPrompt(goal),
      temperature: 0.4,
      maxOutputTokens: 450,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("AI goal insights error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
