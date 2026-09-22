"use client";

import Header from "@/components/Header";
import HabitCheckbox from "@/components/ui/HabitCheckbox";
import { ErrorAlert } from "@/components/ErrorAlert";
import { useAppStore } from "@/stores/app-store";
import { useEffect, useMemo, useState } from "react";
import { TrackerCheckIn } from "./TrackerCheckIn";

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

export function TrackerPageContent() {
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
              type="button"
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
              aria-label="Previous day"
              className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-xs ring-1 ring-gray-200 hover:bg-gray-50"
            >
              ←
            </button>
            <div className="text-sm font-medium text-gray-900">{dateKey}</div>
            <button
              type="button"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              aria-label="Next day"
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

          <TrackerCheckIn
            mood={mood}
            energy={energy}
            weightKg={weightKg}
            notes={notes}
            setMood={setMood}
            setEnergy={setEnergy}
            setWeightKg={setWeightKg}
            setNotes={setNotes}
            log={log}
            recentDailyLogs={recentDailyLogs}
            isSaving={isSaving}
            onSave={() => { void handleSave(); }}
            onSelectDate={setSelectedDate}
          />
        </div>
      </main>
    </div>
  );
}


