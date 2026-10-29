import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  VERIFICATION_RESEND_COOLDOWN_MS,
  remainingVerificationCooldownMs,
  verificationCooldownMessage,
} from "../src/lib/verification-cooldown.ts";

describe("verification resend cooldown", () => {
  it("blocks another send for one minute after a verification email", () => {
    const sentAt = Date.parse("2026-10-29T15:00:00.000Z");
    const until = sentAt + VERIFICATION_RESEND_COOLDOWN_MS;
    assert.equal(remainingVerificationCooldownMs(until, sentAt + 1_000), 59_000);
    assert.equal(remainingVerificationCooldownMs(until, sentAt + 60_000), 0);
    assert.equal(remainingVerificationCooldownMs(null, sentAt), 0);
  });

  it("tells the user to wait instead of reporting a rate limit", () => {
    assert.equal(
      verificationCooldownMessage(59_100),
      "We just sent a verification email. You can request another in 60 seconds."
    );
    assert.equal(
      verificationCooldownMessage(1),
      "We just sent a verification email. You can request another in 1 second."
    );
  });
});