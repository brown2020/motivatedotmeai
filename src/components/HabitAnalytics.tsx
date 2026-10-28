"use client";

import React, { useMemo } from "react";
import { useAppStore } from "@/stores/app-store";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorAlert } from "./ErrorAlert";
import {
  bestCompletionWeekday,
  countCompletionDaysSince,
  currentCompletionStreak,
  longestCompletionStreak,
} from "@/lib/habit-stats";

interface HabitAnalyticsProps {
  habitId: string;
}

interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalCompletions: number;
  bestDayOfWeek: string | null;
  lastWeekCompletions: number;
}

export const HabitAnalytics: React.FC<HabitAnalyticsProps> = ({ habitId }) => {
  const habits = useAppStore((s) => s.habits);
  const loading = useAppStore((s) => s.loading);
  const error = useAppStore((s) => s.error);
  const clearError = useAppStore((s) => s.clearError);
  const habit = habits.find((h) => h.id === habitId);

  const stats = useMemo(() => {
    if (!habit) return null;

    const now = new Date();
    const completions = habit.completions.map((date) => new Date(date));
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 6);
    const last30DaysCompletions = countCompletionDaysSince(
      completions,
      thirtyDaysAgo
    );

    return {
      currentStreak: currentCompletionStreak(completions, now),
      longestStreak: longestCompletionStreak(completions),
      completionRate: Math.min(100, (last30DaysCompletions / 30) * 100),
      totalCompletions: new Set(
        completions.map(
          (date) =>
            new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
        )
      ).size,
      bestDayOfWeek: bestCompletionWeekday(completions),
      lastWeekCompletions: countCompletionDaysSince(completions, weekAgo),
    } satisfies HabitStats;
  }, [habit]);

  if (loading.habits) {
    return <LoadingSpinner size="small" />;
  }

  if (error?.type === "habits") {
    return <ErrorAlert message={error.message} onClose={clearError} />;
  }

  if (!habit || !stats) {
    return <ErrorAlert message="Habit not found" />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Habit Analytics
      </h3>

      {/* Streaks */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-linear-to-br from-indigo-50 to-blue-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500">
            Current Streak
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold text-indigo-600">
              {stats.currentStreak}
            </span>
            <span className="text-sm text-gray-500 ml-1">days</span>
          </div>
        </div>
        <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500">
            Longest Streak
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold text-purple-600">
              {stats.longestStreak}
            </span>
            <span className="text-sm text-gray-500 ml-1">days</span>
          </div>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            30-Day Completion Rate
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {Math.round(stats.completionRate)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-[width] duration-300"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500">
            Total Completions
          </div>
          <div className="mt-1 text-lg font-semibold text-gray-900">
            {stats.totalCompletions}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500">Last 7 Days</div>
          <div className="mt-1 text-lg font-semibold text-gray-900">
            {stats.lastWeekCompletions}/7
          </div>
        </div>
      </div>

      {/* Best Performance */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-sm font-medium text-gray-500 mb-2">
          Best Performance
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-700">
            {stats.bestDayOfWeek ? (
              <>
                You&apos;re most consistent on{" "}
                <span className="font-semibold">{stats.bestDayOfWeek}s</span>
              </>
            ) : (
              "Complete this habit to see which day you stick with it."
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
