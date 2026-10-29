/** Firebase verification emails are easy to trip if Resend follows sign-up immediately. */
export const VERIFICATION_RESEND_COOLDOWN_MS = 60_000;

export function remainingVerificationCooldownMs(
  until: number | null | undefined,
  now: number
): number {
  if (until == null || !Number.isFinite(until)) return 0;
  return Math.max(0, until - now);
}

export function verificationCooldownMessage(remainingMs: number): string {
  const seconds = Math.max(1, Math.ceil(remainingMs / 1000));
  const unit = seconds === 1 ? "second" : "seconds";
  return `We just sent a verification email. You can request another in ${seconds} ${unit}.`;
}
