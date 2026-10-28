import { calendarDaysRemaining, formatDueDate } from "./date-utils.ts";

export function clipText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function goalBelongsToUser(userId: unknown, uid: string): boolean {
  return uid.length > 0 && typeof userId === "string" && userId === uid;
}

export function asDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    try {
      const date = (value as { toDate: () => Date }).toDate();
      return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
    } catch {
      return null;
    }
  }
  return null;
}

export type CoachGoal = {
  name: string;
  reason: string;
  progress: number;
  endDate: Date;
  category?: string;
  priority?: string;
  status?: string;
  tags: string[];
  milestones: {
    name: string;
    targetDate: Date;
    completed: boolean;
    weight: number;
  }[];
};

/** Bound user-controlled goal text before it is sent to the model. */
export function normalizeCoachGoal(data: Record<string, unknown>): CoachGoal | null {
  const name = clipText(data.name, 200);
  const reason = clipText(data.reason, 2000);
  const endDate = asDate(data.endDate);
  if (!name || !reason || !endDate) return null;

  const progressRaw = typeof data.progress === "number" ? data.progress : 0;
  const progress = Math.min(100, Math.max(0, Number.isFinite(progressRaw) ? progressRaw : 0));
  const milestonesRaw = Array.isArray(data.milestones) ? data.milestones.slice(0, 30) : [];
  const milestones = milestonesRaw.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    const milestoneName = clipText(item.name, 200);
    const targetDate = asDate(item.targetDate);
    if (!milestoneName || !targetDate) return [];
    const weightRaw = typeof item.weight === "number" ? item.weight : 0;
    return [
      {
        name: milestoneName,
        targetDate,
        completed: item.completed === true,
        weight: Math.min(100, Math.max(0, Number.isFinite(weightRaw) ? weightRaw : 0)),
      },
    ];
  });
  const tags = (Array.isArray(data.tags) ? data.tags : [])
    .map((tag) => clipText(tag, 40))
    .filter(Boolean)
    .slice(0, 20);

  const category = clipText(data.category, 40);
  const priority = clipText(data.priority, 20);
  const status = clipText(data.status, 40);

  return {
    name,
    reason,
    progress,
    endDate,
    category: category || undefined,
    priority: priority || undefined,
    status: status || undefined,
    tags,
    milestones,
  };
}

export function buildGoalCoachPrompt(goal: CoachGoal, now = new Date()): string {
  const daysRemaining = calendarDaysRemaining(goal.endDate, now);
  const completedMilestones = goal.milestones.filter((m) => m.completed).length;
  const nextMilestone = goal.milestones
    .filter((m) => !m.completed)
    .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime())[0];

  return [
    `Goal: ${goal.name}`,
    `Why it matters: ${goal.reason}`,
    `Progress: ${goal.progress}%`,
    `Due date: ${formatDueDate(goal.endDate)} (${daysRemaining} days remaining)`,
    goal.category ? `Category: ${goal.category}` : undefined,
    goal.priority ? `Priority: ${goal.priority}` : undefined,
    goal.status ? `Status: ${goal.status}` : undefined,
    goal.tags.length ? `Tags: ${goal.tags.join(", ")}` : undefined,
    `Milestones completed: ${completedMilestones}/${goal.milestones.length}`,
    nextMilestone
      ? `Next milestone: ${nextMilestone.name} due ${formatDueDate(nextMilestone.targetDate)} (weight ${nextMilestone.weight}%)`
      : "Next milestone: none",
    "\nOutput format:\n" +
      "1) One-sentence diagnosis of momentum and risk\n" +
      "2) 3 concrete actions for the next 7 days (bulleted)\n" +
      "3) If behind schedule, propose an adjusted milestone plan (max 3 bullets)\n" +
      "4) A short motivational line tied to the user's stated reason\n",
  ]
    .filter(Boolean)
    .join("\n");
}
