import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Regression: protected AI route must call requireSessionUserId (server auth).
 * Client-only checks are not sufficient for next_denied_mutation / next_auth_boundary.
 */
describe("require-session contract", () => {
  it("goal-insights route requires a server session", () => {
    const src = readFileSync(
      join(process.cwd(), "src/app/api/ai/goal-insights/route.ts"),
      "utf8"
    );
    assert.match(src, /requireSessionUserId/);
  });

  it("session verify route exists for proxy checks", () => {
    const src = readFileSync(
      join(process.cwd(), "src/app/api/auth/verify/route.ts"),
      "utf8"
    );
    assert.match(src, /SESSION_COOKIE_NAME|__session|dev_session/);
  });
});
