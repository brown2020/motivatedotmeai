"use client";

import React from "react";
import { formatDisplayDate } from "@/lib/date-utils";
import { useAppStore } from "@/stores/app-store";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorAlert } from "./ErrorAlert";

interface GoalInsightsProps {
  goalId: string;
}

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  overdue: "bg-red-100 text-red-800",
};

function statusClass(status: string | undefined): string {
  return STATUS_STYLES[status || ""] || "bg-gray-100 text-gray-800";
}

function progressBarClass(progress: number, isOnTrack: boolean): string {
  if (progress >= 100) return "bg-green-500";
  if (isOnTrack) return "bg-blue-500";
  return "bg-yellow-500";
}

function GoalInsightsBody({
  goalId,
}: {
  goalId: string;
}) {
  const goals = useAppStore((s) => s.goals);
  const getGoalInsights = useAppStore((s) => s.getGoalInsights);
  const goal = goals.find((g) => g.id === goalId);
  if (!goal) {
    return <ErrorAlert message="Goal not found" />;
  }

  const insights = getGoalInsights(goalId);
  const milestonePct =
    insights.totalMilestones > 0
      ? (insights.completedMilestones / insights.totalMilestones) * 100
      : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Insights</h3>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-semibold text-gray-900">{goal.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-[width] duration-300 ${progressBarClass(goal.progress, insights.isOnTrack)}`}
            style={{ width: `${goal.progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass(goal.status)}`}>
            {(goal.status || "not_started").replace("_", " ")}
          </span>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500 mb-1">Time Remaining</div>
          <div className="text-sm font-semibold text-gray-900">
            {insights.daysRemaining > 0 ? `${insights.daysRemaining} days` : "Overdue"}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-sm font-medium text-gray-700 mb-2">Milestones</div>
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${milestonePct}%` }} />
          </div>
          <span className="text-sm text-gray-600">
            {insights.completedMilestones}/{insights.totalMilestones}
          </span>
        </div>
      </div>

      {insights.nextMilestone ? (
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Next Milestone</div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-900">{insights.nextMilestone.name}</div>
            <div className="text-sm text-gray-500 mt-1">
              Due {formatDisplayDate(insights.nextMilestone.targetDate)}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          {goal.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-600">{goal.reason}</div>
      </div>
    </div>
  );
}

export const GoalInsights: React.FC<GoalInsightsProps> = ({ goalId }) => {
  const loading = useAppStore((s) => s.loading);
  const error = useAppStore((s) => s.error);
  const clearError = useAppStore((s) => s.clearError);

  if (loading.goals) return <LoadingSpinner size="small" />;
  if (error?.type === "goals") {
    return <ErrorAlert message={error.message} onClose={clearError} />;
  }
  return <GoalInsightsBody goalId={goalId} />;
};
