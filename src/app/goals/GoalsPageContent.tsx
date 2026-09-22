"use client";

import { formatDisplayDate } from "@/lib/date-utils";

import Header from "@/components/Header";
import { useAppStore } from "@/stores/app-store";
import { QuickstartTemplatePicker } from "@/components/QuickstartTemplatePicker";
import { useState } from "react";
import Link from "next/link";
import type { NewGoalForm } from "@/types/goals";
import { useRouter } from "next/navigation";
import { AddGoalModal } from "./AddGoalModal";

export function GoalsPageContent() {
  const goals = useAppStore((s) => s.goals);
  const addGoal = useAppStore((s) => s.addGoal);
  const deleteGoal = useAppStore((s) => s.deleteGoal);
  const applyQuickstartTemplate = useAppStore((s) => s.applyQuickstartTemplate);
  const router = useRouter();
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
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

    void addGoal({
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTemplateOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-md shadow-xs text-gray-900 bg-white hover:bg-gray-50"
            >
              Use template
            </button>
            <button
              onClick={() => setIsAddingGoal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-xs text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Add Goal
            </button>
          </div>
        </div>

        <QuickstartTemplatePicker
          isOpen={isTemplateOpen}
          onClose={() => setIsTemplateOpen(false)}
          title="Create a goal from a template"
          description="This adds a new goal + starter habits. You can customize after."
          onPick={async (templateId) => {
            const { goalId } = await applyQuickstartTemplate(templateId);
            setIsTemplateOpen(false);
            router.push(`/goals/${goalId}`);
          }}
        />

        <AddGoalModal
          open={isAddingGoal}
          newGoal={newGoal}
          setNewGoal={setNewGoal}
          tagInput={tagInput}
          setTagInput={setTagInput}
          onSubmit={handleSubmit}
          onClose={() => setIsAddingGoal(false)}
          onAddTag={handleAddTag}
          onRemoveTag={removeTag}
        />

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
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between gap-4">
                        <Link
                          href={`/goals/${goal.id}`}
                          className="flex-1 min-w-0"
                        >
                          <h3 className="text-lg font-medium text-indigo-600 truncate hover:underline">
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
                        </Link>

                        <div className="shrink-0 flex flex-col items-end gap-2">
                          <button
                            onClick={async () => {
                              const ok = window.confirm(
                                `Delete goal \"${goal.name}\"?`
                              );
                              if (!ok) return;
                              await deleteGoal(goal.id);
                            }}
                            className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-red-700 shadow-xs ring-1 ring-red-200 hover:bg-red-50"
                          >
                            Delete
                          </button>

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
                            Due {formatDisplayDate(goal.endDate)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-[width] duration-300 ${
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
