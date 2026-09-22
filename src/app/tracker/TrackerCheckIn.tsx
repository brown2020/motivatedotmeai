"use client";

import { formatDisplayDateTime } from "@/lib/date-utils";

type DailyLogLike = {
  dateKey: string;
  date: Date | string;
  mood?: number;
  energy?: number;
  notes?: string;
  updatedAt?: Date | string;
} | null;

type RecentLog = {
  dateKey: string;
  date: Date | string;
  mood?: number;
  energy?: number;
  notes?: string;
};

type Props = {
  mood: number | "";
  energy: number | "";
  weightKg: number | "";
  notes: string;
  setMood: (v: number | "") => void;
  setEnergy: (v: number | "") => void;
  setWeightKg: (v: number | "") => void;
  setNotes: (v: string) => void;
  log: DailyLogLike;
  recentDailyLogs: RecentLog[];
  isSaving: boolean;
  onSave: () => void;
  onSelectDate: (d: Date) => void;
};

export function TrackerCheckIn({
  mood,
  energy,
  weightKg,
  notes,
  setMood,
  setEnergy,
  setWeightKg,
  setNotes,
  log,
  recentDailyLogs,
  isSaving,
  onSave,
  onSelectDate,
}: Props) {
  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-900">Daily check-in</h2>
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
              setEnergy(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="rounded-md border-gray-300 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-700">Weight (kg, optional)</span>
          <input
            type="number"
            min={0}
            step={0.1}
            value={weightKg}
            onChange={(e) =>
              setWeightKg(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="rounded-md border-gray-300 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </label>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-700">Last updated</span>
          <div className="text-sm text-gray-900">
            {log?.updatedAt ? formatDisplayDateTime(log.updatedAt) : "—"}
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
          placeholder="What worked? What was hard? What's one small win?"
        />
      </label>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Saved per day (mood/energy/notes).
        </div>
        <button
          type="button"
          onClick={onSave}
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
            <div className="text-sm text-gray-500">No recent check-ins yet.</div>
          ) : (
            recentDailyLogs.map((l) => (
              <button
                key={l.dateKey}
                type="button"
                onClick={() => {
                  const d = new Date(l.date);
                  d.setHours(0, 0, 0, 0);
                  onSelectDate(d);
                }}
                className="w-full text-left rounded-md border border-gray-200 p-3 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900">{l.dateKey}</div>
                  <div className="text-xs text-gray-500">
                    {l.mood ? `Mood ${l.mood}` : ""}
                    {l.energy ? ` • Energy ${l.energy}` : ""}
                  </div>
                </div>
                {l.notes ? (
                  <div className="mt-1 text-sm text-gray-600">{l.notes}</div>
                ) : null}
              </button>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
