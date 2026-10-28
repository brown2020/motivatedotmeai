import { create } from "zustand";
import {
  FirestoreError,
  Timestamp,
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  deleteField,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  writeBatch,
  orderBy,
  limit as limitQuery,
  where,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase";
import type { Goal, Milestone } from "@/types/goals";
import type { Habit } from "@/types/habits";
import type { UserDoc, DailyLog } from "@/types/user";
import {
  QUICKSTART_TEMPLATES,
  buildQuickstartGoalAndHabits,
} from "@/lib/quickstart-templates";
import { calendarDaysRemaining, isSameLocalDay, parseDateKey, startOfLocalDay } from "@/lib/date-utils";
import { deriveGoalStatus } from "@/lib/goal-status";

// Re-export types for convenience
export type { DailyLog } from "@/types/user";
export type { Habit } from "@/types/habits";

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
  extends Omit<Goal, "endDate" | "milestones" | "lastUpdated" | "startDate"> {
  endDate: Timestamp;
  milestones: FirestoreMilestone[];
  userId: string;
  lastUpdated: Timestamp;
  startDate?: Timestamp;
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
  dailyLogsByDateKey: Record<string, DailyLog | null | undefined>;
  recentDailyLogs: DailyLog[];

  clearError: () => void;

  initForUser: (uid: string | null) => void;

  addGoal: (goal: Omit<Goal, "id" | "userId">) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  applyQuickstartTemplate: (templateId: string) => Promise<{ goalId: string }>;

  addHabit: (
    habit: Omit<Habit, "id" | "completions" | "userId">
  ) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  toggleHabitCompletionToday: (habitId: string) => Promise<void>;

  updateGoalProgress: (goalId: string, progress: number) => Promise<void>;
  completeMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  setUserPreferences: (preferences: UserDoc["preferences"]) => Promise<void>;
  setProfilePhotoURL: (url: string | null) => Promise<void>;
  getGoalInsights: (goalId: string) => {
    daysRemaining: number;
    completedMilestones: number;
    totalMilestones: number;
    isOnTrack: boolean;
    nextMilestone?: Milestone;
  };

  loadDailyLog: (dateKey: string) => Promise<void>;
  saveDailyLog: (
    dateKey: string,
    patch: Omit<DailyLog, "dateKey" | "createdAt" | "updatedAt" | "date">
  ) => Promise<void>;
  loadRecentDailyLogs: (max: number) => Promise<void>;

  _uid: string | null;
  _unsubs: Unsub[];
}

function timestampToDate(value: unknown): Date | null {
  if (!value || typeof value !== "object" || !("toDate" in value)) return null;
  const toDate = (value as { toDate?: unknown }).toDate;
  if (typeof toDate !== "function") return null;
  try {
    const date = (toDate as () => Date).call(value);
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  } catch {
    return null;
  }
}

function omitUndefined<T extends Record<string, unknown>>(obj: T) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as Omit<T, never>;
}

export const useAppStore = create<AppState>((set, get) => ({
  goals: [],
  habits: [],
  user: null,
  loading: DEFAULT_LOADING,
  error: null,
  dailyLogsByDateKey: {},
  recentDailyLogs: [],

  _uid: null,
  _unsubs: [],

  clearError: () => set({ error: null }),

  initForUser: (uid) => {
    const state = get();
    if (state._uid === uid) return;

    // Cleanup existing subscriptions before setting new uid
    state._unsubs.forEach((u) => u());

    // Set uid and unsubs atomically to prevent double-init race
    set({
      _uid: uid,
      _unsubs: [],
      goals: [],
      habits: [],
      user: null,
      error: null,
      dailyLogsByDateKey: {},
      recentDailyLogs: [],
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
      set({ error: { type, message: error.message } });
    };

    // Goals subscription
    const goalsQuery = query(
      collection(getClientDb(), "goals"),
      where("userId", "==", uid)
    );
    const unsubGoals = onSnapshot(
      goalsQuery,
      (snapshot) => {
        try {
          const goalsData: Goal[] = [];
          let skipped = false;
          snapshot.forEach((d) => {
            const data = d.data() as FirestoreGoal;
            const endDate = timestampToDate(data.endDate);
            if (!endDate) {
              skipped = true;
              return;
            }
            const rawMilestones = Array.isArray(data.milestones)
              ? data.milestones
              : [];
            const milestones = rawMilestones.flatMap((m) => {
              const targetDate = timestampToDate(m?.targetDate);
              if (!m || !targetDate) return [];
              return [{ ...m, targetDate }];
            });
            const progress =
              typeof data.progress === "number" && Number.isFinite(data.progress)
                ? data.progress
                : 0;
            goalsData.push({
              ...data,
              id: d.id,
              endDate,
              milestones,
              progress,
              tags: Array.isArray(data.tags) ? data.tags : [],
              lastUpdated: timestampToDate(data.lastUpdated) ?? new Date(),
              startDate: timestampToDate(data.startDate) ?? undefined,
              status: deriveGoalStatus(endDate, progress),
            });
          });
          set((prev) => ({
            goals: goalsData,
            loading: { ...prev.loading, goals: false },
            error: skipped
              ? {
                  type: "goals",
                  message: "Some goals could not be read and were skipped.",
                }
              : prev.error?.type === "goals"
                ? null
                : prev.error,
          }));
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Could not read goals.";
          set({ error: { type: "goals", message } });
        }
      },
      (error) => handleFirestoreError(error, "goals")
    );

    // Habits subscription
    const habitsQuery = query(
      collection(getClientDb(), "habits"),
      where("userId", "==", uid)
    );
    const unsubHabits = onSnapshot(
      habitsQuery,
      (snapshot) => {
        try {
          const habitsData: Habit[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as FirestoreHabit;
            const raw = Array.isArray(data.completions) ? data.completions : [];
            habitsData.push({
              ...data,
              id: d.id,
              completions: raw.flatMap((t) => {
                const date = timestampToDate(t);
                return date ? [date] : [];
              }),
            });
          });
          set((prev) => ({
            habits: habitsData,
            loading: { ...prev.loading, habits: false },
          }));
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Could not read habits.";
          set({ error: { type: "habits", message } });
        }
      },
      (error) => handleFirestoreError(error, "habits")
    );

    // Create the profile once. Merging these defaults on every load wipes
    // photo, onboarding, and preferences.
    const userRef = doc(getClientDb(), "users", uid);
    runTransaction(getClientDb(), async (tx) => {
      const existing = await tx.get(userRef);
      if (existing.exists()) return;
      tx.set(userRef, {
        userId: uid,
        profilePhotoURL: null,
        onboardingComplete: false,
        preferences: {
          darkMode: false,
          notifications: true,
          reminderTimes: [],
        },
      } satisfies UserDoc);
    }).catch((error) => handleFirestoreError(error as FirestoreError, "user"));

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
      const newGoal = omitUndefined({
        ...goalData,
        userId: uid,
        endDate: Timestamp.fromDate(goalData.endDate),
        startDate: Timestamp.fromDate(goalData.startDate ?? goalData.lastUpdated),
        milestones: goalData.milestones.map((m) => ({
          ...m,
          targetDate: Timestamp.fromDate(m.targetDate),
        })),
        lastUpdated: Timestamp.fromDate(goalData.lastUpdated),
      }) as Omit<FirestoreGoal, "id">;

      await addDoc(collection(getClientDb(), "goals"), newGoal);
    } catch (error) {
      const e = error as FirestoreError;
      set({ error: { type: "operation", message: e.message } });
      throw error;
    }
  },

  updateGoal: async (goalData) => {
    const uid = get()._uid;
    if (!uid) return;

    try {
      const { id: goalId, ...goalWithoutId } = goalData;
      const goalRef = doc(getClientDb(), "goals", goalId);

      const updatedGoal = omitUndefined({
        ...goalWithoutId,
        userId: uid,
        endDate: Timestamp.fromDate(goalData.endDate),
        startDate: goalData.startDate
          ? Timestamp.fromDate(goalData.startDate)
          : undefined,
        milestones: goalData.milestones.map((m) => ({
          ...m,
          targetDate: Timestamp.fromDate(m.targetDate),
        })),
        lastUpdated: Timestamp.fromDate(goalData.lastUpdated),
      }) as Omit<FirestoreGoal, "id">;

      await updateDoc(goalRef, updatedGoal);
    } catch (error) {
      const e = error as FirestoreError;
      set({ error: { type: "operation", message: e.message } });
      throw error;
    }
  },

  deleteGoal: async (goalId) => {
    const uid = get()._uid;
    if (!uid) return;

    try {
      await deleteDoc(doc(getClientDb(), "goals", goalId));
    } catch (error) {
      const e = error as FirestoreError;
      set({ error: { type: "operation", message: e.message } });
      throw error;
    }
  },

  applyQuickstartTemplate: async (templateId) => {
    const uid = get()._uid;
    if (!uid) throw new Error("Not signed in");

    const template = QUICKSTART_TEMPLATES.find((t) => t.id === templateId);
    if (!template) throw new Error("Unknown template");

    try {
      const { goal, habits } = buildQuickstartGoalAndHabits(template);

      const batch = writeBatch(getClientDb());

      const goalRef = doc(collection(getClientDb(), "goals"));
      batch.set(
        goalRef,
        omitUndefined({
          ...goal,
          userId: uid,
          endDate: Timestamp.fromDate(goal.endDate),
          milestones: goal.milestones.map((m) => ({
            ...m,
            targetDate: Timestamp.fromDate(m.targetDate),
          })),
          startDate: Timestamp.fromDate(goal.startDate ?? goal.lastUpdated),
          lastUpdated: Timestamp.fromDate(goal.lastUpdated),
        }) as Record<string, unknown>
      );

      for (const habit of habits) {
        const habitRef = doc(collection(getClientDb(), "habits"));
        batch.set(
          habitRef,
          omitUndefined({
            ...habit,
            userId: uid,
            goalId: goalRef.id,
            completions: [],
            createdAt: Timestamp.now(),
          }) as Record<string, unknown>
        );
      }

      batch.set(
        doc(getClientDb(), "users", uid),
        { onboardingComplete: true, onboardingTemplateId: templateId },
        { merge: true }
      );

      await batch.commit();
      return { goalId: goalRef.id };
    } catch (error) {
      const e = error as FirestoreError;
      set({ error: { type: "operation", message: e.message } });
      throw error;
    }
  },

  addHabit: async (habit) => {
    const uid = get()._uid;
    if (!uid) return;

    try {
      await addDoc(
        collection(getClientDb(), "habits"),
        omitUndefined({
          ...habit,
          userId: uid,
          completions: [],
          createdAt: Timestamp.now(),
        }) as Record<string, unknown>
      );
    } catch (error) {
      const e = error as FirestoreError;
      set({ error: { type: "operation", message: e.message } });
      throw error;
    }
  },

  deleteHabit: async (habitId) => {
    const uid = get()._uid;
    if (!uid) return;

    try {
      await deleteDoc(doc(getClientDb(), "habits", habitId));
    } catch (error) {
      const e = error as FirestoreError;
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
      const todayCompletion = habit.completions.find((d) =>
        isSameLocalDay(d, now)
      );

      const habitRef = doc(getClientDb(), "habits", habitId);

      if (todayCompletion) {
        // Remove today's completion atomically
        await updateDoc(habitRef, {
          completions: arrayRemove(Timestamp.fromDate(todayCompletion)),
          updatedAt: Timestamp.now(),
        });
      } else {
        // Add today's completion atomically
        await updateDoc(habitRef, {
          completions: arrayUnion(Timestamp.fromDate(now)),
          updatedAt: Timestamp.now(),
        });
      }
    } catch (error) {
      const e = error as FirestoreError;
      set({ error: { type: "operation", message: e.message } });
      throw error;
    }
  },

  updateGoalProgress: async (goalId, progress) => {
    const uid = get()._uid;
    if (!uid) return;

    try {
      await updateDoc(doc(getClientDb(), "goals", goalId), { progress });
    } catch (error) {
      const e = error as FirestoreError;
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

      await updateDoc(doc(getClientDb(), "goals", goalId), {
        milestones: updatedMilestones.map((m) => ({
          ...m,
          targetDate: Timestamp.fromDate(m.targetDate),
        })),
      });
    } catch (error) {
      const e = error as FirestoreError;
      set({ error: { type: "operation", message: e.message } });
      throw error;
    }
  },

  setUserPreferences: async (preferences) => {
    const uid = get()._uid;
    if (!uid) return;

    try {
      await setDoc(doc(getClientDb(), "users", uid), { preferences }, { merge: true });
    } catch (error) {
      const e = error as FirestoreError;
      set({ error: { type: "operation", message: e.message } });
      throw error;
    }
  },

  setProfilePhotoURL: async (url) => {
    const uid = get()._uid;
    if (!uid) return;

    try {
      await setDoc(
        doc(getClientDb(), "users", uid),
        { profilePhotoURL: url },
        { merge: true }
      );
    } catch (error) {
      const e = error as FirestoreError;
      set({ error: { type: "operation", message: e.message } });
      throw error;
    }
  },

  getGoalInsights: (goalId) => {
    const goal = get().goals.find((g) => g.id === goalId);
    if (!goal) throw new Error("Goal not found");

    const now = new Date();
    const daysRemaining = calendarDaysRemaining(goal.endDate, now);
    const completedMilestones = goal.milestones.filter(
      (m) => m.completed
    ).length;
    const totalMilestones = goal.milestones.length;

    const start =
      goal.startDate instanceof Date && !Number.isNaN(goal.startDate.getTime())
        ? goal.startDate
        : null;
    let isOnTrack: boolean;
    if (!start) {
      isOnTrack = goal.progress >= 100 || daysRemaining >= 0;
    } else {
      const totalTime =
        startOfLocalDay(goal.endDate).getTime() - startOfLocalDay(start).getTime();
      const elapsedTime =
        startOfLocalDay(now).getTime() - startOfLocalDay(start).getTime();
      const expectedProgress =
        totalTime <= 0
          ? 100
          : Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
      isOnTrack = goal.progress >= expectedProgress;
    }

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

  loadDailyLog: async (dateKey) => {
    const uid = get()._uid;
    if (!uid) return;

    try {
      const logRef = doc(getClientDb(), "users", uid, "dailyLogs", dateKey);
      const snap = await getDoc(logRef);
      if (!snap.exists()) {
        set((prev) => ({
          dailyLogsByDateKey: { ...prev.dailyLogsByDateKey, [dateKey]: null },
        }));
        return;
      }

      const data = snap.data() as {
        dateKey: string;
        date?: unknown;
        mood?: number;
        energy?: number;
        weightKg?: number;
        notes?: string;
        createdAt?: unknown;
        updatedAt?: unknown;
      };

      const date = timestampToDate(data.date);
      const createdAt = timestampToDate(data.createdAt);
      const updatedAt = timestampToDate(data.updatedAt);
      if (!date || !createdAt || !updatedAt) {
        throw new Error("Daily log is missing required dates.");
      }

      const log: DailyLog = {
        dateKey,
        date,
        mood: data.mood,
        energy: data.energy,
        weightKg: data.weightKg,
        notes: data.notes,
        createdAt,
        updatedAt,
      };

      set((prev) => ({
        dailyLogsByDateKey: { ...prev.dailyLogsByDateKey, [dateKey]: log },
      }));
    } catch (error) {
      const e = error as FirestoreError;
      set({ error: { type: "operation", message: e.message } });
      throw error;
    }
  },

  saveDailyLog: async (dateKey, patch) => {
    const uid = get()._uid;
    if (!uid) return;

    const date = parseDateKey(dateKey);
    if (Number.isNaN(date.getTime())) {
      throw new Error("Invalid date.");
    }

    try {
      const logRef = doc(getClientDb(), "users", uid, "dailyLogs", dateKey);
      const now = Timestamp.now();

      await runTransaction(getClientDb(), async (tx) => {
        const existing = await tx.get(logRef);
        const data: Record<string, unknown> = {
          dateKey,
          date: Timestamp.fromDate(date),
          updatedAt: now,
        };
        if (!existing.exists()) data.createdAt = now;

        const assign = (key: "mood" | "energy" | "weightKg" | "notes") => {
          const value = patch[key];
          if (value === undefined || value === "") {
            if (existing.exists()) data[key] = deleteField();
            return;
          }
          data[key] = value;
        };
        assign("mood");
        assign("energy");
        assign("weightKg");
        assign("notes");

        tx.set(logRef, data, { merge: true });
      });
      await get().loadDailyLog(dateKey);
    } catch (error) {
      const e = error as FirestoreError;
      set({ error: { type: "operation", message: e.message } });
      throw error;
    }
  },

  loadRecentDailyLogs: async (max) => {
    const uid = get()._uid;
    if (!uid) return;

    try {
      const q = query(
        collection(getClientDb(), "users", uid, "dailyLogs"),
        orderBy("date", "desc"),
        limitQuery(max)
      );

      const snap = await getDocs(q);
      const logs: DailyLog[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data() as {
          dateKey: string;
          date?: unknown;
          mood?: number;
          energy?: number;
          weightKg?: number;
          notes?: string;
          createdAt?: unknown;
          updatedAt?: unknown;
        };
        const date = timestampToDate(data.date);
        const createdAt = timestampToDate(data.createdAt);
        const updatedAt = timestampToDate(data.updatedAt);
        if (!date || !createdAt || !updatedAt) return;
        logs.push({
          dateKey: data.dateKey,
          date,
          mood: data.mood,
          energy: data.energy,
          weightKg: data.weightKg,
          notes: data.notes,
          createdAt,
          updatedAt,
        });
      });

      set({ recentDailyLogs: logs });
    } catch (error) {
      const e = error as FirestoreError;
      set({ error: { type: "operation", message: e.message } });
      throw error;
    }
  },
}));
