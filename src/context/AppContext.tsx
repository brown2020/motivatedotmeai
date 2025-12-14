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
  setDoc,
  deleteDoc,
  doc,
  onSnapshot,
  Timestamp,
  FirestoreError,
} from "firebase/firestore";
import { Goal, Milestone } from "@/types/goals";

interface FirestoreMilestone extends Omit<Milestone, "targetDate"> {
  targetDate: Timestamp;
}

interface FirestoreGoal
  extends Omit<Goal, "endDate" | "milestones" | "lastUpdated"> {
  endDate: Timestamp;
  milestones: FirestoreMilestone[];
  userId: string;
  lastUpdated: Timestamp;
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
  userId?: string;
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
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  addHabit: (
    habit: Omit<Habit, "id" | "completions" | "userId">
  ) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  toggleHabitCompletionToday: (habitId: string) => Promise<void>;
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
            tags: data.tags || [],
            lastUpdated: data.lastUpdated
              ? data.lastUpdated.toDate()
              : new Date(),
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
      setUser(null);
      setLoading((prev) => ({ ...prev, user: false }));
      return;
    }

    setLoading((prev) => ({ ...prev, user: true }));
    const userRef = doc(db, "users", authUser.uid);

    // Ensure the user's profile/preferences doc exists.
    // We keep `userId` inside the document for easier querying/auditing.
    setDoc(
      userRef,
      {
        userId: authUser.uid,
        onboardingComplete: false,
        preferences: {
          darkMode: false,
          notifications: true,
          reminderTimes: [],
        },
      } satisfies User,
      { merge: true }
    ).catch((error) => handleFirestoreError(error as FirestoreError, "user"));

    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setUser(snapshot.data() as User);
        } else {
          setUser(null);
        }
        setLoading((prev) => ({ ...prev, user: false }));
      },
      (error) => handleFirestoreError(error, "user")
    );

    return () => unsubscribe();
  }, [authUser?.uid]);

  // Sync dark mode preference to the documentElement class.
  useEffect(() => {
    const prefersDark = user?.preferences?.darkMode === true;
    document.documentElement.classList.toggle("dark", prefersDark);
  }, [user?.preferences?.darkMode]);

  const addGoal = async (goalData: Omit<Goal, "id" | "userId">) => {
    if (!authUser?.uid) return;

    try {
      const newGoal: Omit<FirestoreGoal, "id"> = {
        ...goalData,
        userId: authUser.uid,
        endDate: Timestamp.fromDate(goalData.endDate),
        milestones: goalData.milestones.map((m) => ({
          ...m,
          targetDate: Timestamp.fromDate(m.targetDate),
        })),
        lastUpdated: Timestamp.fromDate(goalData.lastUpdated),
      };

      await addDoc(collection(db, "goals"), newGoal);
    } catch (error) {
      handleFirestoreError(error as FirestoreError, "operation");
    }
  };

  const updateGoal = async (goalData: Goal) => {
    if (!authUser?.uid) return;

    try {
      const { id: goalId, ...goalWithoutId } = goalData;
      const goalRef = doc(db, "goals", goalId);
      const updatedGoal: Omit<FirestoreGoal, "id"> = {
        ...goalWithoutId,
        userId: authUser.uid,
        endDate: Timestamp.fromDate(goalData.endDate),
        milestones: goalData.milestones.map((m) => ({
          ...m,
          targetDate: Timestamp.fromDate(m.targetDate),
        })),
        lastUpdated: Timestamp.fromDate(goalData.lastUpdated),
      };

      await updateDoc(goalRef, updatedGoal);
    } catch (error) {
      handleFirestoreError(error as FirestoreError, "operation");
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

  const isSameLocalDay = (a: Date, b: Date) => {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const toggleHabitCompletionToday = async (habitId: string) => {
    if (!authUser?.uid) return;

    try {
      const habitRef = doc(db, "habits", habitId);
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) throw new Error("Habit not found");

      const now = new Date();
      const alreadyCompletedToday = habit.completions.some((d) =>
        isSameLocalDay(d, now)
      );

      const nextCompletions = alreadyCompletedToday
        ? habit.completions.filter((d) => !isSameLocalDay(d, now))
        : [...habit.completions, now];

      await updateDoc(habitRef, {
        completions: nextCompletions.map((d) => Timestamp.fromDate(d)),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      handleFirestoreError(error as FirestoreError, "operation");
      throw error;
    }
  };

  const deleteHabit = async (habitId: string) => {
    if (!authUser?.uid) return;

    try {
      await deleteDoc(doc(db, "habits", habitId));
    } catch (error) {
      handleFirestoreError(error as FirestoreError, "operation");
      throw error;
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!authUser?.uid) return;

    try {
      await deleteDoc(doc(db, "goals", goalId));
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
      await setDoc(userRef, { preferences }, { merge: true });
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
    // If lastUpdated is undefined or invalid, use the current date
    let lastUpdated: Date;
    try {
      lastUpdated =
        goal.lastUpdated instanceof Date ? goal.lastUpdated : new Date();
    } catch {
      lastUpdated = new Date();
    }

    const elapsedTime = now.getTime() - lastUpdated.getTime();
    const totalTime = goal.endDate.getTime() - lastUpdated.getTime();
    // If totalTime is 0 or negative, consider the goal off track
    const expectedProgress =
      totalTime <= 0 ? 100 : (elapsedTime / totalTime) * 100;
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
        updateGoal,
        deleteGoal,
        addHabit,
        deleteHabit,
        toggleHabitCompletionToday,
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
