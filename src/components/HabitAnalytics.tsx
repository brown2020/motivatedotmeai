"use client";

import React, { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorAlert } from "./ErrorAlert";

interface HabitAnalyticsProps {
  habitId: string;
}

interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalCompletions: number;
  bestDayOfWeek: string;
  lastWeekCompletions: number;
}

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const HabitAnalytics: React.FC<HabitAnalyticsProps> = ({ habitId }) => {
  const { habits, loading, error, clearError } = useApp();
  const habit = habits.find((h) => h.id === habitId);

  const stats = useMemo(() => {
    if (!habit) return null;

    const now = new Date();
    const completions = habit.completions.sort(
      (a, b) => b.getTime() - a.getTime()
    );

    // Calculate current streak
    let currentStreak = 0;
    let lastDate = now;
    for (const date of completions) {
      const dayDiff = Math.floor(
        (lastDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (dayDiff <= 1) {
        currentStreak++;
        lastDate = date;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let currentCount = 0;
    lastDate = completions[0];
    for (const date of completions) {
      if (!lastDate) {
        currentCount = 1;
      } else {
        const dayDiff = Math.floor(
          (lastDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (dayDiff <= 1) {
          currentCount++;
        } else {
          longestStreak = Math.max(longestStreak, currentCount);
          currentCount = 1;
        }
      }
      lastDate = date;
    }
    longestStreak = Math.max(longestStreak, currentCount);

    // Calculate completion rate (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last30DaysCompletions = completions.filter(
      (date) => date >= thirtyDaysAgo
    ).length;
    const completionRate = (last30DaysCompletions / 30) * 100;

    // Calculate best day of week
    const dayCount = new Array(7).fill(0);
    completions.forEach((date) => {
      dayCount[date.getDay()]++;
    });
    const bestDayIndex = dayCount.indexOf(Math.max(...dayCount));

    // Calculate last week completions
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekCompletions = completions.filter(
      (date) => date >= weekAgo
    ).length;

    return {
      currentStreak,
      longestStreak,
      completionRate,
      totalCompletions: completions.length,
      bestDayOfWeek: DAYS_OF_WEEK[bestDayIndex],
      lastWeekCompletions,
    } as HabitStats;
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
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Habit Analytics
      </h3>

      {/* Streaks */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4">
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
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
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
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
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
            You&apos;re most consistent on{" "}
            <span className="font-semibold">{stats.bestDayOfWeek}s</span>
          </div>
        </div>
      </div>
    </div>
  );
};
