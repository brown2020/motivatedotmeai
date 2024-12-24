"use client";

import Header from "@/components/Header";
import { useApp } from "@/context/AppContext";
import { useState } from "react";

interface NewHabitForm {
  name: string;
  goalId: string;
  frequency: "daily" | "weekly";
  reminderTime?: string;
}

export default function HabitsPage() {
  const { habits, goals, addHabit } = useApp();
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabit, setNewHabit] = useState<NewHabitForm>({
    name: "",
    goalId: "",
    frequency: "daily",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addHabit(newHabit);
    setIsAddingHabit(false);
    setNewHabit({
      name: "",
      goalId: "",
      frequency: "daily",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Your Habits
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Build and track your daily and weekly habits
            </p>
          </div>
          <button
            onClick={() => setIsAddingHabit(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Habit
          </button>
        </div>

        {isAddingHabit && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-lg font-medium mb-4">Add New Habit</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Habit Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={newHabit.name}
                      onChange={(e) =>
                        setNewHabit({ ...newHabit, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="goalId"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Related Goal
                    </label>
                    <select
                      id="goalId"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={newHabit.goalId}
                      onChange={(e) =>
                        setNewHabit({ ...newHabit, goalId: e.target.value })
                      }
                    >
                      <option value="">Select a goal</option>
                      {goals.map((goal) => (
                        <option key={goal.id} value={goal.id}>
                          {goal.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="frequency"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Frequency
                    </label>
                    <select
                      id="frequency"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={newHabit.frequency}
                      onChange={(e) =>
                        setNewHabit({
                          ...newHabit,
                          frequency: e.target.value as "daily" | "weekly",
                        })
                      }
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="reminderTime"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Reminder Time (Optional)
                    </label>
                    <input
                      type="time"
                      id="reminderTime"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={newHabit.reminderTime || ""}
                      onChange={(e) =>
                        setNewHabit({
                          ...newHabit,
                          reminderTime: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddingHabit(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
                  >
                    Add Habit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mt-6">
          {habits.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No habits
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new habit.
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul role="list" className="divide-y divide-gray-200">
                {habits.map((habit) => {
                  const relatedGoal = goals.find((g) => g.id === habit.goalId);
                  const completedToday = habit.completions.some(
                    (date) =>
                      new Date(date).toDateString() ===
                      new Date().toDateString()
                  );

                  return (
                    <li key={habit.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-indigo-600 truncate">
                              {habit.name}
                            </h3>
                            {relatedGoal && (
                              <p className="mt-1 text-sm text-gray-500">
                                Goal: {relatedGoal.name}
                              </p>
                            )}
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <div className="flex items-center space-x-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  completedToday
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {completedToday
                                  ? "Completed Today"
                                  : "Not Completed"}
                              </span>
                              <span className="text-sm text-gray-500">
                                {habit.frequency}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
