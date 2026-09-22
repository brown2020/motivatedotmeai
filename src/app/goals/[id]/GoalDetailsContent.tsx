"use client";

import { formatDisplayDate } from "@/lib/date-utils";

import { useAppStore } from "@/stores/app-store";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { GoalInsights } from "@/components/GoalInsights";
import { GoalAiCoach } from "@/components/GoalAiCoach";
import { useState } from "react";
import { MilestonePanel } from "./MilestonePanel";

export function GoalDetailsContent() {
  const goals = useAppStore((s) => s.goals);
  const updateGoal = useAppStore((s) => s.updateGoal);
  const deleteGoal = useAppStore((s) => s.deleteGoal);
  const params = useParams()!;
  const router = useRouter();
  const goalId = params.id as string;
  const goal = goals.find((g) => g.id === goalId);

  const [isDeleting, setIsDeleting] = useState(false);

  if (!goal) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Goal not found
            </h3>
          </div>
        </main>
      </div>
    );
  }

  const handleProgressUpdate = (newProgress: number) => {
    void updateGoal({
      ...goal,
      progress: Math.min(100, Math.max(0, newProgress)),
      lastUpdated: new Date(),
    });
  };

  const handleDeleteGoal = async () => {
    if (!goal) return;
    setIsDeleting(true);
    try {
      await deleteGoal(goal.id);
      router.push("/goals");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900 truncate">
                {goal.name}
              </h1>
              <p className="mt-1 text-sm text-gray-600">{goal.reason}</p>
            </div>
            <button
              onClick={handleDeleteGoal}
              disabled={isDeleting}
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium shadow-xs bg-white text-red-700 ring-1 ring-red-200 hover:bg-red-50"
            >
              {isDeleting ? "Deleting…" : "Delete goal"}
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column - Goal Details and Progress */}
          <div className="space-y-6">
            {/* Progress Update */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Progress
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {goal.progress}%
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleProgressUpdate(goal.progress - 10)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50"
                    >
                      -10%
                    </button>
                    <button
                      onClick={() => handleProgressUpdate(goal.progress + 10)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50"
                    >
                      +10%
                    </button>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-[width] duration-300"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Goal Information */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Details
              </h2>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Category
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {goal.category}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Priority
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {goal.priority}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Due Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDisplayDate(goal.endDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                        goal.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : goal.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : goal.status === "overdue"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {(goal.status || "not_started").replace("_", " ")}
                    </span>
                  </dd>
                </div>
              </dl>
              {goal.tags?.length > 0 && (
                <div className="mt-4">
                  <dt className="text-sm font-medium text-gray-500">Tags</dt>
                  <dd className="mt-1">
                    <div className="flex flex-wrap gap-2">
                      {goal.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </dd>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Milestones and Analytics */}
          <div className="space-y-6">
            <MilestonePanel
              goal={goal}
              onUpdateMilestones={(milestones) => {
                void updateGoal({
                  ...goal,
                  milestones,
                  lastUpdated: new Date(),
                });
              }}
            />

            <GoalInsights goalId={goalId} />

            {/* AI Coach */}
            <GoalAiCoach goalId={goalId} />
          </div>
        </div>
      </main>
    </div>
  );
}
