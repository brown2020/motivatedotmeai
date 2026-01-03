import type {
  GoalCategory,
  GoalPriority,
  GoalStatus,
  Milestone,
} from "@/types/goals";

export type HabitFrequency = "daily" | "weekly";

export interface QuickstartHabitTemplate {
  name: string;
  frequency: HabitFrequency;
  reminderTime?: string;
}

export interface QuickstartTemplate {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  priority: GoalPriority;
  durationWeeks: number;
  goalName: string;
  goalReason: string;
  tags: string[];
  milestones: Array<{
    name: string;
    weekOffset: number; // 0..durationWeeks
    weight: number; // contributes to progress
  }>;
  habits: QuickstartHabitTemplate[];
}

export const QUICKSTART_TEMPLATES: QuickstartTemplate[] = [
  {
    id: "lose-weight",
    title: "Lose weight (12 weeks)",
    description:
      "A simple plan with nutrition + movement habits you can check off daily.",
    category: "health",
    priority: "high",
    durationWeeks: 12,
    goalName: "Lose weight in a sustainable way",
    goalReason: "Feel healthier, improve energy, and build lasting habits.",
    tags: ["health", "nutrition", "fitness"],
    milestones: [
      { name: "Week 1: set baseline + meal plan", weekOffset: 1, weight: 10 },
      { name: "Week 4: consistent routine", weekOffset: 4, weight: 25 },
      { name: "Week 8: increase intensity", weekOffset: 8, weight: 30 },
      { name: "Week 12: finish + maintain", weekOffset: 12, weight: 35 },
    ],
    habits: [
      { name: "Track food (5 min)", frequency: "daily", reminderTime: "20:00" },
      { name: "Walk 20 minutes", frequency: "daily", reminderTime: "12:00" },
      { name: "Workout session", frequency: "weekly", reminderTime: "09:00" },
    ],
  },
  {
    id: "get-fit",
    title: "Get fit (8 weeks)",
    description: "Build a consistent training habit with clear weekly targets.",
    category: "health",
    priority: "high",
    durationWeeks: 8,
    goalName: "Get fitter and stronger",
    goalReason: "Improve stamina and strength with a consistent routine.",
    tags: ["fitness", "strength", "cardio"],
    milestones: [
      { name: "Week 1: establish schedule", weekOffset: 1, weight: 15 },
      { name: "Week 3: increase volume", weekOffset: 3, weight: 25 },
      { name: "Week 6: measurable improvement", weekOffset: 6, weight: 30 },
      { name: "Week 8: finish and re-plan", weekOffset: 8, weight: 30 },
    ],
    habits: [
      { name: "Strength workout", frequency: "weekly", reminderTime: "07:30" },
      { name: "Cardio session", frequency: "weekly", reminderTime: "07:30" },
      { name: "Stretch / mobility", frequency: "daily", reminderTime: "21:00" },
    ],
  },
  {
    id: "learn-language",
    title: "Learn a language (10 weeks)",
    description:
      "Daily practice with review milestones to build momentum quickly.",
    category: "education",
    priority: "medium",
    durationWeeks: 10,
    goalName: "Learn a new language",
    goalReason: "Open new opportunities and communicate confidently.",
    tags: ["language", "learning"],
    milestones: [
      { name: "Week 1: pick resources + routine", weekOffset: 1, weight: 10 },
      {
        name: "Week 4: first conversation practice",
        weekOffset: 4,
        weight: 30,
      },
      { name: "Week 7: 500-word milestone", weekOffset: 7, weight: 25 },
      { name: "Week 10: mini assessment", weekOffset: 10, weight: 35 },
    ],
    habits: [
      { name: "Study 15 minutes", frequency: "daily", reminderTime: "08:00" },
      { name: "Flashcards review", frequency: "daily", reminderTime: "18:00" },
      {
        name: "Conversation practice",
        frequency: "weekly",
        reminderTime: "19:00",
      },
    ],
  },
  {
    id: "meditation",
    title: "Meditation (4 weeks)",
    description:
      "A low-friction mindfulness routine that builds a daily streak.",
    category: "personal",
    priority: "medium",
    durationWeeks: 4,
    goalName: "Build a meditation habit",
    goalReason: "Reduce stress and improve focus with daily practice.",
    tags: ["mindfulness", "stress"],
    milestones: [
      { name: "Week 1: 3+ sessions", weekOffset: 1, weight: 20 },
      { name: "Week 2: consistent daily time", weekOffset: 2, weight: 25 },
      { name: "Week 3: longer sessions", weekOffset: 3, weight: 25 },
      { name: "Week 4: maintain and reflect", weekOffset: 4, weight: 30 },
    ],
    habits: [
      { name: "Meditate 5 minutes", frequency: "daily", reminderTime: "07:30" },
      { name: "Journal 2 minutes", frequency: "daily", reminderTime: "21:30" },
    ],
  },
  {
    id: "save-money",
    title: "Save money (12 weeks)",
    description: "Track spending weekly and build a savings routine.",
    category: "finance",
    priority: "medium",
    durationWeeks: 12,
    goalName: "Save money consistently",
    goalReason: "Build financial security and reduce money stress.",
    tags: ["finance", "budget"],
    milestones: [
      { name: "Week 1: set budget + categories", weekOffset: 1, weight: 15 },
      { name: "Week 4: first review + adjust", weekOffset: 4, weight: 25 },
      { name: "Week 8: reduce one expense", weekOffset: 8, weight: 25 },
      { name: "Week 12: savings checkpoint", weekOffset: 12, weight: 35 },
    ],
    habits: [
      {
        name: "Track spending (5 min)",
        frequency: "daily",
        reminderTime: "20:30",
      },
      {
        name: "Weekly budget review",
        frequency: "weekly",
        reminderTime: "10:00",
      },
    ],
  },
];

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : String(Date.now()) + Math.random().toString(16).slice(2);
}

export function buildQuickstartGoalAndHabits(template: QuickstartTemplate) {
  const now = new Date();
  const endDate = addDays(now, template.durationWeeks * 7);
  const status: GoalStatus = "not_started";

  const milestones: Milestone[] = template.milestones.map((m) => ({
    id: makeId(),
    name: m.name,
    targetDate: addDays(now, m.weekOffset * 7),
    completed: false,
    weight: m.weight,
  }));

  const goal = {
    name: template.goalName,
    reason: template.goalReason,
    endDate,
    progress: 0,
    milestones,
    category: template.category,
    priority: template.priority,
    status,
    tags: template.tags,
    lastUpdated: now,
    metrics: undefined,
    reminderFrequency: undefined,
    nextReminder: undefined,
  };

  const habits = template.habits.map((h) => ({
    name: h.name,
    frequency: h.frequency,
    reminderTime: h.reminderTime,
  }));

  return { goal, habits };
}


