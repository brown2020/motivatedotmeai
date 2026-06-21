"use client";

import { ErrorAlert } from "@/components/ErrorAlert";
import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";
import { useRouter } from "next/navigation";

function GoogleMark() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.32 2.98-7.36Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.97-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.6-4.12H3.05v2.59A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.4 13.92a6.01 6.01 0 0 1 0-3.84V7.49H3.05a10 10 0 0 0 0 9.02l3.35-2.59Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.96c1.47 0 2.8.5 3.84 1.5l2.86-2.87A9.61 9.61 0 0 0 12 2a10 10 0 0 0-8.95 5.49l3.35 2.59C7.2 7.72 9.4 5.96 12 5.96Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function SignInClient({ nextPath }: { nextPath?: string }) {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isSigningIn = useAuthStore((s) => s.isSigningIn);
  const authError = useAuthStore((s) => s.error);
  const clearAuthError = useAuthStore((s) => s.clearError);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const signOut = useAuthStore((s) => s.signOut);
  const router = useRouter();

  const target = nextPath || "/dashboard";

  const handleSignIn = async () => {
    const ok = await signInWithGoogle();
    if (ok) router.push(target);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50" />
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_480px]">
        <section className="hidden border-r border-slate-200 bg-white px-10 py-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-600 text-sm font-bold text-white">
                M
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Motivate.me
                </p>
                <p className="text-sm text-slate-500">Goals, habits, momentum</p>
              </div>
            </div>

            <div className="mt-20 max-w-xl">
              <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">
                Today
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                Pick up exactly where you left off.
              </h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
                Your dashboard keeps the day practical: current goals, active
                habits, and the next useful move.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="text-sm font-medium text-slate-950">
                  Weekly focus
                </p>
                <p className="mt-1 text-sm text-slate-500">3 active goals</p>
              </div>
              <div className="rounded-md bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                68%
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {[
                ["Morning run", "Done", "bg-emerald-500"],
                ["Portfolio draft", "Next", "bg-amber-500"],
                ["Read 20 pages", "Tonight", "bg-indigo-500"],
              ].map(([label, status, color]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 rounded-md bg-white px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                    <span className="text-sm font-medium text-slate-700">
                      {label}
                    </span>
                  </div>
                  <span className="text-sm text-slate-500">{status}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-8">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-600 text-sm font-bold text-white">
                M
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Motivate.me
                </p>
                <p className="text-sm text-slate-500">Goals and habits</p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  Welcome back
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Sign in to continue to your dashboard.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                {user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => router.push(target)}
                      className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Continue
                    </button>
                    <button
                      type="button"
                      onClick={signOut}
                      className="flex w-full items-center justify-center rounded-md bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-xs ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleSignIn}
                    disabled={isSigningIn}
                    className="flex w-full items-center justify-center gap-3 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    <GoogleMark />
                    {isSigningIn ? "Signing in..." : "Continue with Google"}
                  </button>
                )}
              </div>

              {authError && (
                <div className="mt-5" aria-live="polite">
                  <ErrorAlert message={authError} onClose={clearAuthError} />
                </div>
              )}

              <p className="mt-6 text-center text-xs leading-5 text-slate-500">
                By continuing, you agree to the{" "}
                <Link
                  href="/terms"
                  className="font-medium text-slate-700 underline-offset-4 hover:underline"
                >
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-slate-700 underline-offset-4 hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
