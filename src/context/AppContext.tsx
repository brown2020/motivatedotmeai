"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  Timestamp,
  FirestoreError,
} from "firebase/firestore";

interface Milestone {
  id: string;
  name: string;
  targetDate: Date;
  completed: boolean;
  weight: number; // Percentage this milestone contributes to overall goal
}

interface FirestoreMilestone extends Omit<Milestone, "targetDate"> {
  targetDate: Timestamp;
}

interface Goal {
  id: string;
  name: string;
  reason: string;
  endDate: Date;
  progress: number;
  category:
    | "personal"
    | "professional"
    | "health"
    | "learning"
    | "financial"
    | "other";
  priority: "low" | "medium" | "high";
  milestones: Milestone[];
  userId: string;
  status: "not_started" | "in_progress" | "completed" | "overdue";
  tags: string[];
  metrics?: {
    type: "numeric" | "boolean" | "percentage";
    target: number;
    current: number;
    unit?: string;
  };
  lastUpdated: Date;
  reminderFrequency?: "daily" | "weekly" | "monthly";
  nextReminder?: Date;
}

interface FirestoreGoal extends Omit<Goal, "endDate" | "milestones"> {
  endDate: Timestamp;
  milestones: FirestoreMilestone[];
}

interface Habit {
  id: string;
  name: string;
  goalId: string;
  frequency: "daily" | "weekly";
  reminderTime?: string;
  completions: Date[];
  userId: string;
}

interface FirestoreHabit extends Omit<Habit, "completions"> {
  completions: Timestamp[];
}

interface User {
  onboardingComplete: boolean;
  preferences: {
    darkMode: boolean;
    notifications: boolean;
    reminderTimes: string[];
  };
}

interface LoadingState {
  goals: boolean;
  habits: boolean;
  user: boolean;
}

interface ErrorState {
  type: "goals" | "habits" | "user" | "operation";
  message: string;
}

interface AppContextType {
  goals: Goal[];
  habits: Habit[];
  user: User | null;
  loading: LoadingState;
  error: ErrorState | null;
  clearError: () => void;
  addGoal: (goal: Omit<Goal, "id" | "userId">) => Promise<void>;
  addHabit: (
    habit: Omit<Habit, "id" | "completions" | "userId">
  ) => Promise<void>;
  completeHabit: (habitId: string) => Promise<void>;
  updateGoalProgress: (goalId: string, progress: number) => Promise<void>;
  completeMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  setUserPreferences: (preferences: User["preferences"]) => Promise<void>;
  calculateGoalProgress: (goalId: string) => Promise<void>;
  updateGoalStatus: (goalId: string) => Promise<void>;
  getGoalInsights: (goalId: string) => {
    daysRemaining: number;
    completedMilestones: number;
    totalMilestones: number;
    isOnTrack: boolean;
    nextMilestone?: Milestone;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_LOADING_STATE: LoadingState = {
  goals: true,
  habits: true,
  user: true,
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<LoadingState>(DEFAULT_LOADING_STATE);
  const [error, setError] = useState<ErrorState | null>(null);
  const { user: authUser } = useAuth();

  const handleFirestoreError = (
    error: FirestoreError,
    type: ErrorState["type"]
  ) => {
    console.error(`Firestore error (${type}):`, error);
    setError({
      type,
      message: error.message,
    });
  };

  const clearError = () => {
    setError(null);
  };

  // Subscribe to user's goals
  useEffect(() => {
    if (!authUser?.uid) {
      setLoading((prev) => ({ ...prev, goals: false }));
      return;
    }

    setLoading((prev) => ({ ...prev, goals: true }));
    const q = query(
      collection(db, "goals"),
      where("userId", "==", authUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const goalsData: Goal[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as FirestoreGoal;
          goalsData.push({
            ...data,
            id: doc.id,
            endDate: data.endDate.toDate(),
            milestones: data.milestones.map((m) => ({
              ...m,
              targetDate: m.targetDate.toDate(),
            })),
          });
        });
        setGoals(goalsData);
        setLoading((prev) => ({ ...prev, goals: false }));
      },
      (error) => handleFirestoreError(error, "goals")
    );

    return () => unsubscribe();
  }, [authUser?.uid]);

  // Subscribe to user's habits
  useEffect(() => {
    if (!authUser?.uid) {
      setLoading((prev) => ({ ...prev, habits: false }));
      return;
    }

    setLoading((prev) => ({ ...prev, habits: true }));
    const q = query(
      collection(db, "habits"),
      where("userId", "==", authUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const habitsData: Habit[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as FirestoreHabit;
          habitsData.push({
            ...data,
            id: doc.id,
            completions: data.completions.map((d) => d.toDate()),
          });
        });
        setHabits(habitsData);
        setLoading((prev) => ({ ...prev, habits: false }));
      },
      (error) => handleFirestoreError(error, "habits")
    );

    return () => unsubscribe();
  }, [authUser?.uid]);

  // Subscribe to user's preferences
  useEffect(() => {
    if (!authUser?.uid) {
      setLoading((prev) => ({ ...prev, user: false }));
      return;
    }

    setLoading((prev) => ({ ...prev, user: true }));
    const q = query(
      collection(db, "users"),
      where("userId", "==", authUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data() as User;
          setUser(userData);
        }
        setLoading((prev) => ({ ...prev, user: false }));
      },
      (error) => handleFirestoreError(error, "user")
    );

    return () => unsubscribe();
  }, [authUser?.uid]);

  const addGoal = async (goal: Omit<Goal, "id" | "userId">) => {
    if (!authUser?.uid) return;

    try {
      await addDoc(collection(db, "goals"), {
        ...goal,
        userId: authUser.uid,
        endDate: Timestamp.fromDate(goal.endDate),
        milestones: goal.milestones.map((m) => ({
          ...m,
          targetDate: Timestamp.fromDate(m.targetDate),
        })),
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      handleFirestoreError(error as FirestoreError, "operation");
      throw error; // Re-throw to handle in the UI
    }
  };

  const addHabit = async (
    habit: Omit<Habit, "id" | "completions" | "userId">
  ) => {
    if (!authUser?.uid) return;

    try {
      await addDoc(collection(db, "habits"), {
        ...habit,
        userId: authUser.uid,
        completions: [],
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      handleFirestoreError(error as FirestoreError, "operation");
      throw error;
    }
  };

  const completeHabit = async (habitId: string) => {
    if (!authUser?.uid) return;

    try {
      const habitRef = doc(db, "habits", habitId);
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) throw new Error("Habit not found");

      await updateDoc(habitRef, {
        completions: [
          ...habit.completions.map((d) => Timestamp.fromDate(d)),
          Timestamp.now(),
        ],
      });
    } catch (error) {
      handleFirestoreError(error as FirestoreError, "operation");
      throw error;
    }
  };

  const updateGoalProgress = async (goalId: string, progress: number) => {
    if (!authUser?.uid) return;

    try {
      const goalRef = doc(db, "goals", goalId);
      await updateDoc(goalRef, { progress });
    } catch (error) {
      handleFirestoreError(error as FirestoreError, "operation");
      throw error;
    }
  };

  const completeMilestone = async (goalId: string, milestoneId: string) => {
    if (!authUser?.uid) return;

    try {
      const goalRef = doc(db, "goals", goalId);
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) throw new Error("Goal not found");

      const updatedMilestones = goal.milestones.map((milestone) =>
        milestone.id === milestoneId
          ? { ...milestone, completed: true }
          : milestone
      );

      await updateDoc(goalRef, {
        milestones: updatedMilestones.map((m) => ({
          ...m,
          targetDate: Timestamp.fromDate(m.targetDate),
        })),
      });
    } catch (error) {
      handleFirestoreError(error as FirestoreError, "operation");
      throw error;
    }
  };

  const setUserPreferences = async (preferences: User["preferences"]) => {
    if (!authUser?.uid) return;

    try {
      const userRef = doc(db, "users", authUser.uid);
      await updateDoc(userRef, { preferences });
    } catch (error) {
      handleFirestoreError(error as FirestoreError, "operation");
      throw error;
    }
  };

  const calculateGoalProgress = async (goalId: string) => {
    if (!authUser?.uid) return;

    try {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) throw new Error("Goal not found");

      let progress = 0;
      if (goal.metrics) {
        // Calculate progress based on metrics
        progress = Math.min(
          100,
          (goal.metrics.current / goal.metrics.target) * 100
        );
      } else {
        // Calculate progress based on weighted milestones
        const completedWeight = goal.milestones
          .filter((m) => m.completed)
          .reduce((sum, m) => sum + m.weight, 0);
        progress = Math.min(100, completedWeight);
      }

      const goalRef = doc(db, "goals", goalId);
      await updateDoc(goalRef, {
        progress,
        lastUpdated: Timestamp.now(),
      });
    } catch (error) {
      handleFirestoreError(error as FirestoreError, "operation");
      throw error;
    }
  };

  const updateGoalStatus = async (goalId: string) => {
    if (!authUser?.uid) return;

    try {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) throw new Error("Goal not found");

      let status: Goal["status"] = "not_started";
      const now = new Date();

      if (goal.progress >= 100) {
        status = "completed";
      } else if (goal.progress > 0) {
        status = "in_progress";
      } else if (goal.endDate < now) {
        status = "overdue";
      }

      const goalRef = doc(db, "goals", goalId);
      await updateDoc(goalRef, { status });
    } catch (error) {
      handleFirestoreError(error as FirestoreError, "operation");
      throw error;
    }
  };

  const getGoalInsights = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) throw new Error("Goal not found");

    const now = new Date();
    const daysRemaining = Math.ceil(
      (goal.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const completedMilestones = goal.milestones.filter(
      (m) => m.completed
    ).length;
    const totalMilestones = goal.milestones.length;

    // Calculate if the goal is on track
    const elapsedTime = now.getTime() - goal.lastUpdated.getTime();
    const totalTime = goal.endDate.getTime() - goal.lastUpdated.getTime();
    const expectedProgress = (elapsedTime / totalTime) * 100;
    const isOnTrack = goal.progress >= expectedProgress;

    // Find next milestone
    const nextMilestone = goal.milestones
      .filter((m) => !m.completed)
      .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime())[0];

    return {
      daysRemaining,
      completedMilestones,
      totalMilestones,
      isOnTrack,
      nextMilestone,
    };
  };

  return (
    <AppContext.Provider
      value={{
        goals,
        habits,
        user,
        loading,
        error,
        clearError,
        addGoal,
        addHabit,
        completeHabit,
        updateGoalProgress,
        completeMilestone,
        setUserPreferences,
        calculateGoalProgress,
        updateGoalStatus,
        getGoalInsights,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
