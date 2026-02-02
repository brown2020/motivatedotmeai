export interface Habit {
  id: string;
  name: string;
  goalId: string;
  frequency: "daily" | "weekly";
  reminderTime?: string;
  completions: Date[];
  userId: string;
}

export interface NewHabitForm {
  name: string;
  goalId: string;
  frequency: "daily" | "weekly";
  reminderTime?: string;
}
