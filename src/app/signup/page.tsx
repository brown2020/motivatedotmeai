"use client";

import { useState } from "react";
import Link from "next/link";
import { ErrorAlert } from "@/components/ErrorAlert";
import { PasswordField } from "@/components/auth/PasswordField";
import { useAuthStore } from "@/stores/auth-store";

export default function SignUpPage() {
  const isSigningIn = useAuthStore((s) => s.isSigningIn);
  const authError = useAuthStore((s) => s.error);
  const clearAuthError = useAuthStore((s) => s.clearError);
  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await signUpWithEmail(email, password, name);
    if (ok) window.location.assign("/dashboard");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Track goals and habits with an email and password.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="signup-name" className="block text-sm font-medium text-slate-700">
              Display name
            </label>
            <input
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSigningIn}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="signup-email"
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
          <PasswordField
            label="Password"
            value={password}
            onChange={setPassword}
            disabled={isSigningIn}
            autoComplete="new-password"
            name="new-password"
          />
          <button
            type="submit"
            disabled={isSigningIn}
            className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSigningIn ? "Creating account…" : "Create account"}
          </button>
        </form>

        {authError && (
          <div className="mt-5" aria-live="polite">
            <ErrorAlert message={authError} onClose={clearAuthError} />
          </div>
        )}

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
