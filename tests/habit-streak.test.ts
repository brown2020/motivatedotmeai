import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  currentCompletionStreak,
  longestCompletionStreak,
} from "../src/lib/habit-stats.ts";

describe("habit streaks", () => {
  const now = new Date(2026, 9, 28, 21, 0);

  it("keeps a streak that ended yesterday", () => {
    const dates = [
      new Date(2026, 9, 27, 9, 0),
      new Date(2026, 9, 26, 22, 0),
    ];
    assert.equal(currentCompletionStreak(dates, now), 2);
  });

  it("counts two completions on the same day as one streak day", () => {
    const dates = [
      new Date(2026, 9, 28, 8, 0),
      new Date(2026, 9, 28, 20, 0),
      new Date(2026, 9, 27, 8, 0),
    ];
    assert.equal(currentCompletionStreak(dates, now), 2);
    assert.equal(longestCompletionStreak(dates), 2);
  });

  it("does not mutate the input list", () => {
    const dates = [new Date(2026, 9, 28, 8, 0), new Date(2026, 9, 26, 8, 0)];
    const before = dates.map((date) => date.getTime());
    longestCompletionStreak(dates);
    assert.deepEqual(
      dates.map((date) => date.getTime()),
      before
    );
  });
});
