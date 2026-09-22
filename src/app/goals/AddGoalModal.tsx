"use client";

import type { NewGoalForm, GoalCategory, GoalPriority } from "@/types/goals";

type Props = {
  open: boolean;
  newGoal: NewGoalForm;
  setNewGoal: React.Dispatch<React.SetStateAction<NewGoalForm>>;
  tagInput: string;
  setTagInput: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onAddTag: (e: React.KeyboardEvent) => void;
  onRemoveTag: (tag: string) => void;
};

export function AddGoalModal({
  open,
  newGoal,
  setNewGoal,
  tagInput,
  setTagInput,
  onSubmit,
  onClose,
  onAddTag,
  onRemoveTag,
}: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-lg font-medium mb-4">Add New Goal</h2>
              <form onSubmit={onSubmit}>
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
                              onClick={() => onRemoveTag(tag)}
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
                        onKeyDown={onAddTag}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => onClose()}
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
  );
}
