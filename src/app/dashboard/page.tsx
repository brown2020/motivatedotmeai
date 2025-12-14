"use client";

import Header from "@/components/Header";
import { useAppStore } from "@/stores/app-store";
import Link from "next/link";
import { useMemo } from "react";

export default function DashboardPage() {
  const goals = useAppStore((s) => s.goals);
  const habits = useAppStore((s) => s.habits);

  const currentStreakDays = useMemo(() => {
    const all = habits.flatMap((h) => h.completions.map((d) => new Date(d)));
    if (all.length === 0) return 0;

    const byDay = new Set(
      all.map((d) =>
        new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
      )
    );

    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    while (byDay.has(cursor.getTime())) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }, [habits]);

  const recentActivity = useMemo(() => {
    const goalItems = goals.map((g) => ({
      type: "goal" as const,
      id: g.id,
      title: g.name,
      subtitle: `${g.progress}% complete`,
      ts: new Date(g.lastUpdated || g.endDate).getTime(),
      href: `/goals/${g.id}`,
    }));

    const habitItems = habits.flatMap((h) =>
      h.completions.map((d) => ({
        type: "habit" as const,
        id: `${h.id}:${new Date(d).getTime()}`,
        title: h.name,
        subtitle: `Completed ${new Date(d).toLocaleDateString()}`,
        ts: new Date(d).getTime(),
        href: `/habits/${h.id}`,
      }))
    );

    return [...goalItems, ...habitItems]
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 10);
  }, [goals, habits]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome Back!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {`Here's an overview of your progress today.`}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Stats Cards */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Goals
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {goals.length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link
                href="/goals"
                className="text-sm text-indigo-700 hover:text-indigo-900"
              >
                View all goals
              </Link>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Habits
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {habits.length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link
                href="/habits"
                className="text-sm text-indigo-700 hover:text-indigo-900"
              >
                View all habits
              </Link>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Streak
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {currentStreakDays}{" "}
                        {currentStreakDays === 1 ? "day" : "days"}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <span className="text-sm text-gray-500">Keep it up!</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <div className="mt-3 bg-white shadow-sm overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {recentActivity.length === 0 ? (
                <li className="px-4 py-4 sm:px-6">
                  <div className="text-center text-gray-500">
                    <p>No recent activity</p>
                    <p className="mt-1 text-sm">
                      Start by adding some goals or habits!
                    </p>
                  </div>
                </li>
              ) : (
                recentActivity.map((item) => (
                  <li key={item.id} className="px-4 py-4 sm:px-6">
                    <Link href={item.href} className="block hover:underline">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {item.title}
                        </p>
                        <div className="ml-2 shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
