import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { hasVerifiedEmail } from "../src/lib/verified-email.ts";

describe("verified email", () => {
  it("accepts only an explicit true claim", () => {
    assert.equal(hasVerifiedEmail({ email_verified: true }), true);
    assert.equal(hasVerifiedEmail({ email_verified: false }), false);
    assert.equal(hasVerifiedEmail({}), false);
  });

  it("session creation checks the claim before issuing a cookie", () => {
    const src = readFileSync(
      join(process.cwd(), "src/app/api/auth/session/route.ts"),
      "utf8"
    );
    const check = src.indexOf("hasVerifiedEmail");
    const cookie = src.indexOf("createSessionCookie");
    assert.ok(check > 0);
    assert.ok(cookie > check);
  });
});
