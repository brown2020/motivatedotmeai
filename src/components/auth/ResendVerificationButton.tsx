"use client";

import { useEffect, useState } from "react";
import { remainingVerificationCooldownMs } from "@/lib/verification-cooldown";
import { useAuthStore } from "@/stores/auth-store";

export function ResendVerificationButton({
  email,
  password,
  onResend,
}: {
  email: string;
  password: string;
  onResend: () => void;
}) {
  const isSigningIn = useAuthStore((s) => s.isSigningIn);
  const until = useAuthStore((s) => s.verificationCooldownUntil);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (remainingVerificationCooldownMs(until, Date.now()) <= 0) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [until]);

  const seconds = Math.ceil(remainingVerificationCooldownMs(until, now) / 1000);
  const coolingDown = seconds > 0;

  return (
    <>
      <button
        type="button"
        onClick={onResend}
        disabled={isSigningIn || coolingDown || email.trim() === "" || password === ""}
        className="flex w-full items-center justify-center rounded-md bg-white px-4 py-3 text-sm font-semibold text-indigo-700 shadow-xs ring-1 ring-indigo-200 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:ring-slate-200"
      >
        {coolingDown ? `Resend available in ${seconds}s` : "Resend verification email"}
      </button>
      <p className="text-center text-xs text-slate-500">
        {coolingDown
          ? "We just sent a verification email. Wait before requesting another."
          : "Resend uses the email and password above."}
      </p>
    </>
  );
}
