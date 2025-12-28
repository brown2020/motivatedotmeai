"use client";

import Header from "@/components/Header";
import HabitCheckbox from "@/components/ui/HabitCheckbox";
import { ErrorAlert } from "@/components/ErrorAlert";
import { useAppStore } from "@/stores/app-store";
import { useEffect, useMemo, useState } from "react";

function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, delta: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + delta);
  return d;
}

export default function TrackerPage() {
  const habits = useAppStore((s) => s.habits);
  const error = useAppStore((s) => s.error);
  const clearError = useAppStore((s) => s.clearError);

  const loadDailyLog = useAppStore((s) => s.loadDailyLog);
  const saveDailyLog = useAppStore((s) => s.saveDailyLog);
  const dailyLogsByDateKey = useAppStore((s) => s.dailyLogsByDateKey);
  const recentDailyLogs = useAppStore((s) => s.recentDailyLogs);
  const loadRecentDailyLogs = useAppStore((s) => s.loadRecentDailyLogs);

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [isSaving, setIsSaving] = useState(false);

  const dateKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);
  const isToday = useMemo(() => {
    const now = new Date();
    return toDateKey(now) === dateKey;
  }, [dateKey]);

  const log = dailyLogsByDateKey[dateKey] ?? null;

  const [mood, setMood] = useState<number | "">("");
  const [energy, setEnergy] = useState<number | "">("");
  const [weightKg, setWeightKg] = useState<number | "">("");
  const [notes, setNotes] = useState<string>("");

  // Load current log + recent logs when date changes
  useEffect(() => {
    void loadDailyLog(dateKey);
    void loadRecentDailyLogs(7);
  }, [dateKey, loadDailyLog, loadRecentDailyLogs]);

  // Reflect loaded log into local inputs.
  useEffect(() => {
    const current = dailyLogsByDateKey[dateKey];
    if (current && current !== null) {
      setMood(current.mood ?? "");
      setEnergy(current.energy ?? "");
      setWeightKg(current.weightKg ?? "");
      setNotes(current.notes ?? "");
      return;
    }
    if (current === null) {
      setMood("");
      setEnergy("");
      setWeightKg("");
      setNotes("");
    }
  }, [dateKey, dailyLogsByDateKey]);

  const dailyHabits = useMemo(
    () => habits.filter((h) => h.frequency === "daily"),
    [habits]
  );
  const weeklyHabits = useMemo(
    () => habits.filter((h) => h.frequency === "weekly"),
    [habits]
  );

  const isCompletedToday = (completions: Date[]) => {
    const todayKey = toDateKey(new Date());
    return completions.some((d) => toDateKey(new Date(d)) === todayKey);
  };

  const isCompletedThisWeek = (completions: Date[]) => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return completions.some((d) => new Date(d).getTime() >= start.getTime());
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveDailyLog(dateKey, {
        mood: mood === "" ? undefined : mood,
        energy: energy === "" ? undefined : energy,
        weightKg: weightKg === "" ? undefined : weightKg,
        notes: notes.trim() ? notes.trim() : undefined,
      });
      void loadRecentDailyLogs(7);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Tracker</h1>
            <p className="mt-1 text-sm text-gray-600">
              Check off habits and log a quick daily check-in.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
              className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-xs ring-1 ring-gray-200 hover:bg-gray-50"
            >
              ←
            </button>
            <div className="text-sm font-medium text-gray-900">{dateKey}</div>
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-xs ring-1 ring-gray-200 hover:bg-gray-50"
            >
              →
            </button>
            <button
              onClick={() => {
                const d = new Date();
                d.setHours(0, 0, 0, 0);
                setSelectedDate(d);
              }}
              className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-xs ring-1 ring-gray-200 hover:bg-gray-50"
            >
              Today
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 px-4 sm:px-0">
            <ErrorAlert message={error.message} onClose={clearError} />
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 px-4 sm:px-0">
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900">Habits</h2>
            {!isToday && (
              <p className="mt-1 text-sm text-gray-500">
                Habit check-offs are currently tracked for today only.
              </p>
            )}

            <div className="mt-4 space-y-3">
              {dailyHabits.length === 0 && weeklyHabits.length === 0 ? (
                <div className="text-sm text-gray-500">No habits yet.</div>
              ) : (
                <>
                  {dailyHabits.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-gray-700">
                        Daily
                      </div>
                      <div className="mt-2 space-y-2">
                        {dailyHabits.map((h) => (
                          <div key={h.id} className="flex items-center gap-3">
                            {isToday ? (
                              <HabitCheckbox
                                habitId={h.id}
                                name={h.name}
                                completed={isCompletedToday(h.completions)}
                              />
                            ) : (
                              <div className="flex-1 rounded-lg border border-gray-200 p-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {h.name}
                                </div>
                                <div className="mt-1 text-xs text-gray-500">
                                  {isCompletedToday(h.completions)
                                    ? "Completed today"
                                    : "Not completed today"}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {weeklyHabits.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-sm font-semibold text-gray-700">
                        Weekly
                      </div>
                      <div className="mt-2 space-y-2">
                        {weeklyHabits.map((h) => (
                          <div
                            key={h.id}
                            className="rounded-lg border border-gray-200 p-4"
                          >
                            <div className="text-sm font-medium text-gray-900">
                              {h.name}
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              {isCompletedThisWeek(h.completions)
                                ? "Completed in last 7 days"
                                : "Not completed in last 7 days"}
                            </div>
                            {isToday && (
                              <div className="mt-3">
                                <HabitCheckbox
                                  habitId={h.id}
                                  name="Mark done today"
                                  completed={isCompletedToday(h.completions)}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900">
              Daily check-in
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              30 seconds. Helps you notice patterns.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-700">Mood (1–5)</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={mood}
                  onChange={(e) =>
                    setMood(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="rounded-md border-gray-300 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-700">Energy (1–5)</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={energy}
                  onChange={(e) =>
                    setEnergy(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="rounded-md border-gray-300 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-700">
                  Weight (kg, optional)
                </span>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={weightKg}
                  onChange={(e) =>
                    setWeightKg(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="rounded-md border-gray-300 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </label>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-700">Last updated</span>
                <div className="text-sm text-gray-900">
                  {log?.updatedAt
                    ? new Date(log.updatedAt).toLocaleString()
                    : "—"}
                </div>
              </div>
            </div>

            <label className="mt-4 flex flex-col gap-1">
              <span className="text-sm text-gray-700">Notes (optional)</span>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-md border-gray-300 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="What worked? What was hard? What’s one small win?"
              />
            </label>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Saved per day (mood/energy/notes).
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-indigo-700"
              >
                {isSaving ? "Saving…" : "Save check-in"}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">Recent</h3>
              <div className="mt-2 space-y-2">
                {recentDailyLogs.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No recent check-ins yet.
                  </div>
                ) : (
                  recentDailyLogs.map((l) => (
                    <button
                      key={l.dateKey}
                      onClick={() => {
                        const d = new Date(l.date);
                        d.setHours(0, 0, 0, 0);
                        setSelectedDate(d);
                      }}
                      className="w-full text-left rounded-md border border-gray-200 p-3 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-900">
                          {l.dateKey}
                        </div>
                        <div className="text-xs text-gray-500">
                          {l.mood ? `Mood ${l.mood}` : ""}
                          {l.energy ? ` • Energy ${l.energy}` : ""}
                        </div>
                      </div>
                      {l.notes && (
                        <div className="mt-1 text-sm text-gray-600">
                          {l.notes}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

