import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseDateKey } from "../src/lib/date-utils.ts";
import { deriveGoalStatus } from "../src/lib/goal-status.ts";

describe("deriveGoalStatus", () => {
  const now = new Date(2026, 9, 28, 18, 0);

  it("does not mark a goal due today as overdue", () => {
    assert.equal(deriveGoalStatus(parseDateKey("2026-10-28"), 0, now), "not_started");
  });

  it("marks a goal due yesterday as overdue", () => {
    assert.equal(deriveGoalStatus(parseDateKey("2026-10-27"), 10, now), "overdue");
  });

  it("marks full progress completed even after the due date", () => {
    assert.equal(deriveGoalStatus(parseDateKey("2026-10-01"), 100, now), "completed");
  });

  it("marks partial progress before the due date as in progress", () => {
    assert.equal(deriveGoalStatus(parseDateKey("2026-12-01"), 15, now), "in_progress");
  });
});
