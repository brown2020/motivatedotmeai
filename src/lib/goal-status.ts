import type { GoalStatus } from "../types/goals.ts";
import { startOfLocalDay } from "./date-utils.ts";

/**
 * Status is derived from the due calendar day and progress.
 * A goal due today stays not-overdue until the local day ends, and progress
 * of 100 is completed even if the stored status field is stale.
 */
export function deriveGoalStatus(
  endDate: Date,
  progress: number,
  now = new Date()
): GoalStatus {
  if (progress >= 100) return "completed";
  if (startOfLocalDay(endDate).getTime() < startOfLocalDay(now).getTime()) {
    return "overdue";
  }
  if (progress > 0) return "in_progress";
  return "not_started";
}
