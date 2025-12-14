import { create } from "zustand";
import {
  FirestoreError,
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Goal, Milestone } from "@/types/goals";

interface Habit {
  id: string;
  name: string;
  goalId: string;
  frequency: "daily" | "weekly";
  reminderTime?: string;
  completions: Date[];
  userId: string;
}

interface UserDoc {
  userId?: string;
  profilePhotoURL?: string | null;
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

interface FirestoreHabit extends Omit<Habit, "completions"> {
  completions: Timestamp[];
}

const DEFAULT_LOADING: LoadingState = { goals: true, habits: true, user: true };

type Unsub = () => void;

interface AppState {
  goals: Goal[];
  habits: Habit[];
  user: UserDoc | null;
  loading: LoadingState;
  error: ErrorState | null;

  clearError: () => void;

  initForUser: (uid: string | null) => void;

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
  setUserPreferences: (preferences: UserDoc["preferences"]) => Promise<void>;
  setProfilePhotoURL: (url: string | null) => Promise<void>;
  calculateGoalProgress: (goalId: string) => Promise<void>;
  updateGoalStatus: (goalId: string) => Promise<void>;
  getGoalInsights: (goalId: string) => {
    daysRemaining: number;
    completedMilestones: number;
    totalMilestones: number;
    isOnTrack: boolean;
    nextMilestone?: Milestone;
  };

  _uid: string | null;
  _unsubs: Unsub[];
}

const isSameLocalDay = (a: Date, b: Date) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

export const useAppStore = create<AppState>((set, get) => ({
  goals: [],
  habits: [],
  user: null,
  loading: DEFAULT_LOADING,
  error: null,

  _uid: null,
  _unsubs: [],

  clearError: () => set({ error: null }),

  initForUser: (uid) => {
    const state = get();
    if (state._uid === uid) return;

    // Cleanup existing subscriptions
    state._unsubs.forEach((u) => u());

    set({
      _uid: uid,
      _unsubs: [],
      goals: [],
      habits: [],
      user: null,
      error: null,
      loading: {
        goals: Boolean(uid),
        habits: Boolean(uid),
        user: Boolean(uid),
      },
    });

    if (!uid) {
      set({ loading: { goals: false, habits: false, user: false } });
      return;
    }

    const handleFirestoreError = (
      error: FirestoreError,
      type: ErrorState["type"]
    ) => {
      console.error(`Firestore error (${type}):`, error);
      set({ error: { type, message: error.message } });
    };

    // Goals subscription
    const goalsQuery = query(
      collection(db, "goals"),
      where("userId", "==", uid)
    );
    const unsubGoals = onSnapshot(
      goalsQuery,
      (snapshot) => {
        const goalsData: Goal[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as FirestoreGoal;
          goalsData.push({
            ...data,
            id: d.id,
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
        set((prev) => ({
          goals: goalsData,
          loading: { ...prev.loading, goals: false },
        }));
      },
      (error) => handleFirestoreError(error, "goals")
    );

    // Habits subscription
    const habitsQuery = query(
      collection(db, "habits"),
      where("userId", "==", uid)
    );
    const unsubHabits = onSnapshot(
      habitsQuery,
      (snapshot) => {
        const habitsData: Habit[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as FirestoreHabit;
          habitsData.push({
            ...data,
            id: d.id,
            completions: (data.completions || []).map((t) => t.toDate()),
          });
        });
        set((prev) => ({
          habits: habitsData,
          loading: { ...prev.loading, habits: false },
        }));
      },
      (error) => handleFirestoreError(error, "habits")
    );

    // User doc: ensure exists + subscribe
    const userRef = doc(db, "users", uid);
    setDoc(
      userRef,
      {
        userId: uid,
        profilePhotoURL: null,
        onboardingComplete: false,
        preferences: {
          darkMode: false,
          notifications: true,
          reminderTimes: [],
        },
      } satisfies UserDoc,
      { merge: true }
    ).catch((error) => handleFirestoreError(error as FirestoreError, "user"));

    const unsubUser = onSnapshot(
      userRef,
      (snapshot) => {
        set((prev) => ({
          user: snapshot.exists() ? (snapshot.data() as UserDoc) : null,
          loading: { ...prev.loading, user: false },
        }));
      },
      (error) => handleFirestoreError(error, "user")
    );

    set({ _unsubs: [unsubGoals, unsubHabits, unsubUser] });
  },

  addGoal: async (goalData) => {
    const uid = get()._uid;
    if (!uid) return;

    try {
      const newGoal: Omit<FirestoreGoal, "id"> = {
        ...goalData,
        userId: uid,
        endDate: Timestamp.fromDate(goalData.endDate),
        milestones: goalData.milestones.map((m) => ({
          ...m,
          targetDate: Timestamp.fromDate(m.targetDate),
        })),
        lastUpdated: Timestamp.fromDate(goalData.lastUpdated),
      };

      await addDoc(collection(db, "goals"), newGoal);
    } catch (error) {
      const e = error as FirestoreError;
      console.error("Firestore error (operation):", e);
      set({ error: { type: "operation", message: e.message } });
    }
  },

  updateGoal: async (goalData) => {
    const uid = get()._uid;
    if (!uid) return;

    try {
      const { id: goalId, ...goalWithoutId } = goalData;
      const goalRef = doc(db, "goals", goalId);

      const updatedGoal: Omit<FirestoreGoal, "id"> = {
        ...goalWithoutId,
        userId: uid,
        endDate: Timestamp.fromDate(goalData.endDate),
        milestones: goalData.milestones.map((m) => ({
          ...m,
          targetDate: Timestamp.fromDate(m.targetDate),
        })),
        lastUpdated: Timestamp.fromDate(goalData.lastUpdated),
      };

      await updateDoc(goalRef, updatedGoal);
    } catch (error) {
      const e = error as FirestoreError;
      console.error("Firestore error (operation):", e);
      set({ error: { type: "operation", message: e.message } });
    }
  },

  deleteGoal: async (goalId) => {
    const uid = get()._uid;
    if (!uid) return;

    try {
      await deleteDoc(doc(db, "goals", goalId));
    } catch (error) {
      const e = error as FirestoreError;
      console.error("Firestore error (operation):", e);
      set({ error: { type: "operation", message: e.message } });
    }
  },

  addHabit: async (habit) => {
    const uid = get()._uid;
    if (!uid) return;

    try {
      await addDoc(collection(db, "habits"), {
        ...habit,
        userId: uid,
        completions: [],
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      const e = error as FirestoreError;
      console.error("Firestore error (operation):", e);
      set({ error: { type: "operation", message: e.message } });
      throw error;
    }
  },

  deleteHabit: async (habitId) => {
    const uid = get()._uid;
    if (!uid) return;

    try {
      await deleteDoc(doc(db, "habits", habitId));
    } catch (error) {
      const e = error as FirestoreError;
      console.error("Firestore error (operation):", e);
      set({ error: { type: "operation", message: e.message } });
      throw error;
    }
  },

  toggleHabitCompletionToday: async (habitId) => {
    const uid = get()._uid;
    if (!uid) return;

    try {
      const habit = get().habits.find((h) => h.id === habitId);
      if (!habit) throw new Error("Habit not found");

      const now = new Date();
      const alreadyCompletedToday = habit.completions.some((d) =>
        isSameLocalDay(d, now)
      );

      const nextCompletions = alreadyCompletedToday
        ? habit.completions.filter((d) => !isSameLocalDay(d, now))
        : [...habit.completions, now];

      await updateDoc(doc(db, "habits", habitId), {
        completions: nextCompletions.map((d) => Timestamp.fromDate(d)),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      const e = error as FirestoreError;
      console.error("Firestore error (operation):", e);
      set({ error: { type: "operation", message: e.message } });
      throw error;
    }
  },

  updateGoalProgress: async (goalId, progress) => {
    const uid = get()._uid;
    if (!uid) return;

    try {
      await updateDoc(doc(db, "goals", goalId), { progress });
    } catch (error) {
      const e = error as FirestoreError;
      console.error("Firestore error (operation):", e);
      set({ error: { type: "operation", message: e.message } });
      throw error;
    }
  },

  completeMilestone: async (goalId, milestoneId) => {
    const uid = get()._uid;
    if (!uid) return;

    try {
      const goal = get().goals.find((g) => g.id === goalId);
      if (!goal) throw new Error("Goal not found");

      const updatedMilestones = goal.milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed: true } : m
      );

      await updateDoc(doc(db, "goals", goalId), {
        milestones: updatedMilestones.map((m) => ({
          ...m,
          targetDate: Timestamp.fromDate(m.targetDate),
        })),
      });
    } catch (error) {
      const e = error as FirestoreError;
      console.error("Firestore error (operation):", e);
      set({ error: { type: "operation", message: e.message } });
      throw error;
    }
  },

  setUserPreferences: async (preferences) => {
    const uid = get()._uid;
    if (!uid) return;

    try {
      await setDoc(doc(db, "users", uid), { preferences }, { merge: true });
    } catch (error) {
      const e = error as FirestoreError;
      console.error("Firestore error (operation):", e);
      set({ error: { type: "operation", message: e.message } });
      throw error;
    }
  },

  setProfilePhotoURL: async (url) => {
    const uid = get()._uid;
    if (!uid) return;

    try {
      await setDoc(
        doc(db, "users", uid),
        { profilePhotoURL: url },
        { merge: true }
      );
    } catch (error) {
      const e = error as FirestoreError;
      console.error("Firestore error (operation):", e);
      set({ error: { type: "operation", message: e.message } });
      throw error;
    }
  },

  calculateGoalProgress: async (goalId) => {
    const uid = get()._uid;
    if (!uid) return;

    try {
      const goal = get().goals.find((g) => g.id === goalId);
      if (!goal) throw new Error("Goal not found");

      let progress = 0;
      if (goal.metrics) {
        progress = Math.min(
          100,
          (goal.metrics.current / goal.metrics.target) * 100
        );
      } else {
        const completedWeight = goal.milestones
          .filter((m) => m.completed)
          .reduce((sum, m) => sum + m.weight, 0);
        progress = Math.min(100, completedWeight);
      }

      await updateDoc(doc(db, "goals", goalId), {
        progress,
        lastUpdated: Timestamp.now(),
      });
    } catch (error) {
      const e = error as FirestoreError;
      console.error("Firestore error (operation):", e);
      set({ error: { type: "operation", message: e.message } });
      throw error;
    }
  },

  updateGoalStatus: async (goalId) => {
    const uid = get()._uid;
    if (!uid) return;

    try {
      const goal = get().goals.find((g) => g.id === goalId);
      if (!goal) throw new Error("Goal not found");

      let status: Goal["status"] = "not_started";
      const now = new Date();

      if (goal.progress >= 100) status = "completed";
      else if (goal.progress > 0) status = "in_progress";
      else if (goal.endDate < now) status = "overdue";

      await updateDoc(doc(db, "goals", goalId), { status });
    } catch (error) {
      const e = error as FirestoreError;
      console.error("Firestore error (operation):", e);
      set({ error: { type: "operation", message: e.message } });
      throw error;
    }
  },

  getGoalInsights: (goalId) => {
    const goal = get().goals.find((g) => g.id === goalId);
    if (!goal) throw new Error("Goal not found");

    const now = new Date();
    const daysRemaining = Math.ceil(
      (goal.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const completedMilestones = goal.milestones.filter(
      (m) => m.completed
    ).length;
    const totalMilestones = goal.milestones.length;

    let lastUpdated: Date;
    try {
      lastUpdated =
        goal.lastUpdated instanceof Date ? goal.lastUpdated : new Date();
    } catch {
      lastUpdated = new Date();
    }

    const elapsedTime = now.getTime() - lastUpdated.getTime();
    const totalTime = goal.endDate.getTime() - lastUpdated.getTime();
    const expectedProgress =
      totalTime <= 0 ? 100 : (elapsedTime / totalTime) * 100;
    const isOnTrack = goal.progress >= expectedProgress;

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
  },
}));
