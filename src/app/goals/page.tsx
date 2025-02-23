"use client";

import Header from "@/components/Header";
import { useApp } from "@/context/AppContext";
import { useState } from "react";
import Link from "next/link";
import { NewGoalForm, GoalCategory, GoalPriority } from "@/types/goals";

export default function GoalsPage() {
  const { goals, addGoal } = useApp();
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState<NewGoalForm>({
    name: "",
    reason: "",
    endDate: "",
    category: "personal",
    priority: "medium",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const endDate = new Date(newGoal.endDate);
    const status = endDate < now ? "overdue" : "not_started";

    addGoal({
      name: newGoal.name,
      reason: newGoal.reason,
      endDate: endDate,
      progress: 0,
      milestones: [],
      category: newGoal.category,
      priority: newGoal.priority,
      status: status,
      tags: newGoal.tags || [],
      lastUpdated: now,
      metrics: undefined,
      reminderFrequency: undefined,
      nextReminder: undefined,
    });
    setIsAddingGoal(false);
    setNewGoal({
      name: "",
      reason: "",
      endDate: "",
      category: "personal",
      priority: "medium",
      tags: [],
    });
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!newGoal.tags.includes(tagInput.trim())) {
        setNewGoal({
          ...newGoal,
          tags: [...newGoal.tags, tagInput.trim()],
        });
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewGoal({
      ...newGoal,
      tags: newGoal.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Your Goals</h1>
            <p className="mt-1 text-sm text-gray-600">
              Track and manage your long-term goals
            </p>
          </div>
          <button
            onClick={() => setIsAddingGoal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-xs text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Goal
          </button>
        </div>

        {isAddingGoal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-lg font-medium mb-4">Add New Goal</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Goal Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={newGoal.name}
                      onChange={(e) =>
                        setNewGoal({ ...newGoal, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="reason"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Motivation
                    </label>
                    <textarea
                      id="reason"
                      required
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={newGoal.reason}
                      onChange={(e) =>
                        setNewGoal({ ...newGoal, reason: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="endDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Target Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={newGoal.endDate}
                      onChange={(e) =>
                        setNewGoal({ ...newGoal, endDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Category
                    </label>
                    <select
                      id="category"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={newGoal.category}
                      onChange={(e) =>
                        setNewGoal({
                          ...newGoal,
                          category: e.target.value as GoalCategory,
                        })
                      }
                    >
                      <option value="personal">Personal</option>
                      <option value="work">Work</option>
                      <option value="health">Health</option>
                      <option value="education">Education</option>
                      <option value="finance">Finance</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="priority"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Priority
                    </label>
                    <select
                      id="priority"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={newGoal.priority}
                      onChange={(e) =>
                        setNewGoal({
                          ...newGoal,
                          priority: e.target.value as GoalPriority,
                        })
                      }
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="tags"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Tags
                    </label>
                    <div className="mt-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {newGoal.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 inline-flex items-center justify-center"
                            >
                              <span className="sr-only">Remove tag</span>×
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        id="tags"
                        className="block w-full rounded-md border-gray-300 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Type and press Enter to add tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddingGoal(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-xs hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-xs hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
                  >
                    Add Goal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mt-6">
          {goals.length === 0 ? (
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No goals
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new goal.
              </p>
            </div>
          ) : (
            <div className="bg-white shadow-sm overflow-hidden sm:rounded-md">
              <ul role="list" className="divide-y divide-gray-200">
                {goals.map((goal) => (
                  <li key={goal.id}>
                    <Link
                      href={`/goals/${goal.id}`}
                      className="block hover:bg-gray-50"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-indigo-600 truncate">
                              {goal.name}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {goal.reason}
                            </p>
                            <div className="mt-2 flex items-center space-x-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-800">
                                {goal.category}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-800">
                                {goal.priority} priority
                              </span>
                              {goal.tags?.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="ml-4 shrink-0">
                            <div className="flex flex-col items-end space-y-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  goal.progress >= 100
                                    ? "bg-green-100 text-green-800"
                                    : goal.progress >= 50
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {goal.progress}% complete
                              </span>
                              <span className="text-sm text-gray-500">
                                Due{" "}
                                {new Date(goal.endDate).toLocaleDateString()}
                              </span>
                              {goal.milestones.length > 0 && (
                                <span className="text-sm text-gray-500">
                                  {
                                    goal.milestones.filter((m) => m.completed)
                                      .length
                                  }
                                  /{goal.milestones.length} milestones completed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                goal.progress >= 100
                                  ? "bg-green-500"
                                  : goal.progress >= 50
                                  ? "bg-blue-500"
                                  : "bg-yellow-500"
                              }`}
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
