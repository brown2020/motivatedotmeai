"use client";

import { useState } from "react";
import Link from "next/link";
import { ErrorAlert } from "@/components/ErrorAlert";
import { useAuthStore } from "@/stores/auth-store";

export default function ForgotPasswordPage() {
  const isSigningIn = useAuthStore((s) => s.isSigningIn);
  const authError = useAuthStore((s) => s.error);
  const info = useAuthStore((s) => s.info);
  const clearAuthError = useAuthStore((s) => s.clearError);
  const clearInfo = useAuthStore((s) => s.clearInfo);
  const sendPasswordReset = useAuthStore((s) => s.sendPasswordReset);

  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendPasswordReset(email);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter your email and we&apos;ll send a reset link if an account exists.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="reset-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSigningIn}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSigningIn}
            className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSigningIn ? "Sending…" : "Send reset link"}
          </button>
        </form>

        {info && (
          <p className="mt-5 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status" aria-live="polite">
            {info}
            <button type="button" onClick={clearInfo} className="ml-2 underline">
              Dismiss
            </button>
          </p>
        )}

        {authError && (
          <div className="mt-5" aria-live="polite">
            <ErrorAlert message={authError} onClose={clearAuthError} />
          </div>
        )}

        <p className="mt-6 text-center text-sm text-slate-600">
          <Link href="/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
