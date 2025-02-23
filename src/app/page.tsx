"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]); // Runs only when `user` or `router` changes

  if (user) {
    return null; // Avoid rendering while redirecting
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Transform Your Goals into Reality
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Harness the power of AI to build better habits, achieve your goals,
            and stay motivated on your journey to success.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              onClick={signInWithGoogle}
              className="rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Get Started with Google
            </button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Smart Goal Tracking</h3>
            <p className="text-gray-600">
              Set meaningful goals and track your progress with AI-powered
              insights.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Habit Building</h3>
            <p className="text-gray-600">
              Develop and maintain positive habits with personalized reminders
              and tracking.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Progress Analytics</h3>
            <p className="text-gray-600">
              Visualize your journey with detailed analytics and progress
              reports.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
