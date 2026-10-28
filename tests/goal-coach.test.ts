import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildGoalCoachPrompt,
  goalBelongsToUser,
  normalizeCoachGoal,
} from "../src/lib/goal-coach.ts";
import { createRateLimiter } from "../src/lib/rate-limit.ts";

describe("goal coach authorization", () => {
  it("requires the goal userId to match the session uid", () => {
    assert.equal(goalBelongsToUser("user-a", "user-a"), true);
    assert.equal(goalBelongsToUser("user-a", "user-b"), false);
    assert.equal(goalBelongsToUser(undefined, "user-a"), false);
  });

  it("clips oversized goal text before it reaches the prompt", () => {
    const huge = "x".repeat(5000);
    const goal = normalizeCoachGoal({
      name: huge,
      reason: "because",
      endDate: new Date(2026, 11, 1),
      progress: 140,
      tags: [huge],
    });
    assert.ok(goal);
    assert.equal(goal.name.length, 200);
    assert.equal(goal.progress, 100);
    assert.equal(goal.tags[0]?.length, 40);
    assert.ok(!buildGoalCoachPrompt(goal).includes(huge));
  });

  it("rate-limits a uid inside the window", () => {
    const limiter = createRateLimiter(2, 1_000);
    assert.equal(limiter.allow("uid", 0), true);
    assert.equal(limiter.allow("uid", 10), true);
    assert.equal(limiter.allow("uid", 20), false);
    assert.equal(limiter.allow("uid", 1_001), true);
  });

  it("loads the goal on the server instead of trusting the client payload", () => {
    const src = readFileSync(
      join(process.cwd(), "src/app/api/ai/goal-insights/route.ts"),
      "utf8"
    );
    assert.match(src, /goalBelongsToUser/);
    assert.match(src, /aiInsightLimiter/);
    assert.match(src, /goalId/);
    assert.doesNotMatch(src, /endDateISO/);
  });
});
