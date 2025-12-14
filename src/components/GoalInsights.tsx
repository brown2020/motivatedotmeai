"use client";

import React from "react";
import { useAppStore } from "@/stores/app-store";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorAlert } from "./ErrorAlert";

interface GoalInsightsProps {
  goalId: string;
}

export const GoalInsights: React.FC<GoalInsightsProps> = ({ goalId }) => {
  const goals = useAppStore((s) => s.goals);
  const loading = useAppStore((s) => s.loading);
  const error = useAppStore((s) => s.error);
  const clearError = useAppStore((s) => s.clearError);
  const getGoalInsights = useAppStore((s) => s.getGoalInsights);
  const goal = goals.find((g) => g.id === goalId);

  if (loading.goals) {
    return <LoadingSpinner size="small" />;
  }

  if (error?.type === "goals") {
    return <ErrorAlert message={error.message} onClose={clearError} />;
  }

  if (!goal) {
    return <ErrorAlert message="Goal not found" />;
  }

  const insights = getGoalInsights(goalId);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Goal Insights
      </h3>

      {/* Progress Overview */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Overall Progress
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {goal.progress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              goal.progress >= 100
                ? "bg-green-500"
                : insights.isOnTrack
                ? "bg-blue-500"
                : "bg-yellow-500"
            }`}
            style={{ width: `${goal.progress}%` }}
          />
        </div>
      </div>

      {/* Status and Timeline */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
          <div className="flex items-center">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500 mb-1">
            Time Remaining
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {insights.daysRemaining > 0
              ? `${insights.daysRemaining} days`
              : "Overdue"}
          </div>
        </div>
      </div>

      {/* Milestones Progress */}
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-700 mb-2">Milestones</div>
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{
                width: `${
                  (insights.completedMilestones / insights.totalMilestones) *
                  100
                }%`,
              }}
            />
          </div>
          <span className="text-sm text-gray-600">
            {insights.completedMilestones}/{insights.totalMilestones}
          </span>
        </div>
      </div>

      {/* Next Milestone */}
      {insights.nextMilestone && (
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">
            Next Milestone
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-900">
              {insights.nextMilestone.name}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Due {insights.nextMilestone.targetDate.toLocaleDateString()}
            </div>
          </div>
        </div>
      )}

      {/* Goal Details */}
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
};
