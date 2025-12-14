"use client";

import Header from "@/components/Header";
import { ErrorAlert } from "@/components/ErrorAlert";
import { HabitAnalytics } from "@/components/HabitAnalytics";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAppStore } from "@/stores/app-store";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function HabitDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const habitId = params.id as string;

  const habits = useAppStore((s) => s.habits);
  const goals = useAppStore((s) => s.goals);
  const loading = useAppStore((s) => s.loading);
  const error = useAppStore((s) => s.error);
  const clearError = useAppStore((s) => s.clearError);
  const toggleHabitCompletionToday = useAppStore(
    (s) => s.toggleHabitCompletionToday
  );
  const deleteHabit = useAppStore((s) => s.deleteHabit);

  const [isDeleting, setIsDeleting] = useState(false);

  const habit = useMemo(
    () => habits.find((h) => h.id === habitId),
    [habits, habitId]
  );

  const relatedGoal = useMemo(
    () => (habit ? goals.find((g) => g.id === habit.goalId) : undefined),
    [goals, habit]
  );

  const completedToday = useMemo(() => {
    if (!habit) return false;
    const today = new Date().toDateString();
    return habit.completions.some((d) => new Date(d).toDateString() === today);
  }, [habit]);

  const handleToggleToday = async () => {
    await toggleHabitCompletionToday(habitId);
  };

  const handleDelete = async () => {
    if (!habit) return;
    setIsDeleting(true);
    try {
      await deleteHabit(habit.id);
      router.push("/habits");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0 flex items-start justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900 truncate">
              {habit?.name || "Habit"}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {relatedGoal ? (
                <>
                  Linked goal:{" "}
                  <Link
                    href={`/goals/${relatedGoal.id}`}
                    className="text-indigo-700 hover:underline"
                  >
                    {relatedGoal.name}
                  </Link>
                </>
              ) : (
                "No linked goal"
              )}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={handleToggleToday}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium shadow-xs border ${
                completedToday
                  ? "bg-white text-gray-900 border-gray-200 hover:bg-gray-50"
                  : "bg-indigo-600 text-white border-transparent hover:bg-indigo-700"
              }`}
              disabled={loading.habits}
            >
              {completedToday ? "Undo today" : "Mark done today"}
            </button>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium shadow-xs bg-white text-red-700 ring-1 ring-red-200 hover:bg-red-50"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>

        {loading.habits ? (
          <div className="mt-10 px-4 sm:px-0">
            <LoadingSpinner />
          </div>
        ) : error?.type === "habits" ? (
          <div className="mt-6 px-4 sm:px-0">
            <ErrorAlert message={error.message} onClose={clearError} />
          </div>
        ) : !habit ? (
          <div className="mt-6 px-4 sm:px-0">
            <ErrorAlert message="Habit not found" />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 px-4 sm:px-0">
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900">Details</h2>
              <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Frequency
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {habit.frequency}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Reminder time
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {habit.reminderTime || "—"}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">Recent</h3>
                <ul className="mt-3 space-y-2">
                  {habit.completions
                    .slice()
                    .sort(
                      (a, b) => new Date(b).getTime() - new Date(a).getTime()
                    )
                    .slice(0, 10)
                    .map((d, idx) => (
                      <li
                        key={`${habit.id}-${idx}`}
                        className="text-sm text-gray-600"
                      >
                        {new Date(d).toLocaleString()}
                      </li>
                    ))}
                  {habit.completions.length === 0 && (
                    <li className="text-sm text-gray-500">
                      No completions yet
                    </li>
                  )}
                </ul>
              </div>
            </section>

            <HabitAnalytics habitId={habit.id} />
          </div>
        )}
      </main>
    </div>
  );
}
