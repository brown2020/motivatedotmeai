import { NextResponse } from "next/server";
import { z } from "zod";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { requireSessionUserId } from "@/lib/require-session";

const GoalPayloadSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  reason: z.string().min(1),
  category: z.string().optional(),
  priority: z.string().optional(),
  progress: z.number().min(0).max(100),
  status: z.string().optional(),
  endDateISO: z.string().min(1),
  lastUpdatedISO: z.string().optional(),
  tags: z.array(z.string()).optional(),
  milestones: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        targetDateISO: z.string(),
        completed: z.boolean(),
        weight: z.number().min(0).max(100),
      })
    )
    .default([]),
});

const RequestSchema = z.object({
  goal: GoalPayloadSchema,
});

function daysBetween(from: Date, to: Date) {
  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export async function POST(req: Request) {
  try {
    // Require auth (session cookie) before spending tokens.
    await requireSessionUserId();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "AI not configured (missing OPENAI_API_KEY)." },
        { status: 501 }
      );
    }

    const json = await req.json();

    // `useChat` sends the payload under `data` by default.
    const candidate =
      json && typeof json === "object" && json !== null && "data" in json
        ? (json as { data?: unknown }).data
        : json;

    const parsed = RequestSchema.safeParse(candidate);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { goal } = parsed.data;

    const now = new Date();
    const endDate = new Date(goal.endDateISO);
    const daysRemaining = daysBetween(now, endDate);

    const milestones = goal.milestones;
    const completedMilestones = milestones.filter((m) => m.completed).length;
    const totalMilestones = milestones.length;
    const remainingMilestones = milestones
      .filter((m) => !m.completed)
      .sort(
        (a, b) =>
          new Date(a.targetDateISO).getTime() -
          new Date(b.targetDateISO).getTime()
      );

    const nextMilestone = remainingMilestones[0];

    const system =
      "You are a pragmatic, encouraging coach for goal achievement. " +
      "You produce concise, structured guidance with clear next actions. " +
      "Never shame the user. Avoid generic advice. Be specific to the goal data.";

    const prompt = [
      `Goal: ${goal.name}`,
      `Why it matters: ${goal.reason}`,
      `Progress: ${goal.progress}%`,
      `Due date: ${endDate
        .toISOString()
        .slice(0, 10)} (${daysRemaining} days remaining)`,
      goal.category ? `Category: ${goal.category}` : undefined,
      goal.priority ? `Priority: ${goal.priority}` : undefined,
      goal.status ? `Status: ${goal.status}` : undefined,
      goal.tags?.length ? `Tags: ${goal.tags.join(", ")}` : undefined,
      `Milestones completed: ${completedMilestones}/${totalMilestones}`,
      nextMilestone
        ? `Next milestone: ${nextMilestone.name} due ${new Date(
            nextMilestone.targetDateISO
          )
            .toISOString()
            .slice(0, 10)} (weight ${nextMilestone.weight}%)`
        : "Next milestone: none",
      "\nOutput format:\n" +
        "1) One-sentence diagnosis of momentum and risk\n" +
        "2) 3 concrete actions for the next 7 days (bulleted)\n" +
        "3) If behind schedule, propose an adjusted milestone plan (max 3 bullets)\n" +
        "4) A short motivational line tied to the user's stated reason\n",
    ]
      .filter(Boolean)
      .join("\n");

    const result = await streamText({
      model: openai("gpt-4o-mini"),
      system,
      prompt,
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
