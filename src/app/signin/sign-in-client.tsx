"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function SignInClient({ nextPath }: { nextPath?: string }) {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const router = useRouter();

  const target = nextPath || "/dashboard";

  const handleSignIn = async () => {
    const ok = await signInWithGoogle();
    if (ok || user) router.push(target);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100" />
    );
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
            {user ? (
              <>
                <button
                  onClick={() => router.push(target)}
                  className="rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Continue
                </button>
                <button
                  onClick={signOut}
                  className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-gray-900 shadow-xs ring-1 ring-gray-200 hover:bg-gray-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={handleSignIn}
                className="rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign in with Google
              </button>
            )}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Smart Goal Tracking</h3>
            <p className="text-gray-600">
              Set meaningful goals and track your progress with AI-powered
              insights.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Habit Building</h3>
            <p className="text-gray-600">
              Develop and maintain positive habits with personalized reminders
              and tracking.
            </p>
          </div>

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
