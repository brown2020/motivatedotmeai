export interface UserPreferences {
  darkMode: boolean;
  notifications: boolean;
  reminderTimes: string[];
}

export interface UserDoc {
  userId?: string;
  profilePhotoURL?: string | null;
  onboardingComplete: boolean;
  preferences: UserPreferences;
}

export interface DailyLog {
  dateKey: string; // YYYY-MM-DD
  date: Date; // midnight local
  mood?: number; // 1-5
  energy?: number; // 1-5
  weightKg?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
