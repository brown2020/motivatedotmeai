import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  QUICKSTART_TEMPLATES,
  buildQuickstartGoalAndHabits,
} from "../src/lib/quickstart-templates.ts";

describe("quickstart templates", () => {
  it("builds a not-started goal and matching habits from a template", () => {
    const template = QUICKSTART_TEMPLATES.find((item) => item.id === "lose-weight");
    assert.ok(template);

    const startedAt = Date.now();
    const { goal, habits } = buildQuickstartGoalAndHabits(template);

    assert.equal(goal.name, template.goalName);
    assert.equal(goal.reason, template.goalReason);
    assert.equal(goal.progress, 0);
    assert.equal(goal.status, "not_started");
    assert.equal(goal.category, template.category);
    assert.equal(goal.milestones.length, template.milestones.length);
    assert.ok(goal.milestones.every((milestone) => milestone.completed === false && milestone.id));
    assert.deepEqual(
      habits.map((habit) => habit.name),
      template.habits.map((habit) => habit.name)
    );

    const spanMs = goal.endDate.getTime() - goal.startDate.getTime();
    const expectedMs = template.durationWeeks * 7 * 24 * 60 * 60 * 1000;
    assert.ok(Math.abs(spanMs - expectedMs) < 2_000);
    assert.ok(goal.startDate.getTime() >= startedAt - 1_000);
  });

  it("gives every template a goal name, milestones, and at least one habit", () => {
    assert.ok(QUICKSTART_TEMPLATES.length > 0);
    for (const template of QUICKSTART_TEMPLATES) {
      const { goal, habits } = buildQuickstartGoalAndHabits(template);
      assert.ok(goal.name.length > 0);
      assert.equal(goal.milestones.length, template.milestones.length);
      assert.ok(habits.length > 0);
      assert.ok(habits.every((habit) => habit.name.length > 0));
    }
  });
});
