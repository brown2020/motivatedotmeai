export type GoalCategory =
  | "personal"
  | "work"
  | "health"
  | "education"
  | "finance"
  | "other";
export type GoalPriority = "low" | "medium" | "high";
export type GoalStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "overdue";
export type ReminderFrequency = "daily" | "weekly" | "monthly";

export interface Milestone {
  id: string;
  name: string;
  targetDate: Date;
  completed: boolean;
  weight: number; // Percentage this milestone contributes to overall goal
}

export interface GoalMetrics {
  type: "numeric" | "boolean" | "percentage";
  target: number;
  current: number;
  unit?: string;
}

export interface Goal {
  id: string;
  name: string;
  reason: string;
  endDate: Date;
  progress: number;
  milestones: Milestone[];
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  tags: string[];
  metrics?: GoalMetrics;
  lastUpdated: Date;
  reminderFrequency?: ReminderFrequency;
  nextReminder?: Date;
}

export interface NewGoalForm {
  name: string;
  reason: string;
  endDate: string;
  category: GoalCategory;
  priority: GoalPriority;
  tags: string[];
}
