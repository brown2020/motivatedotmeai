import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isAllowedSessionOrigin } from "../src/lib/session-origin.ts";

const prod = {
  nodeEnv: "production",
  appUrl: "https://motivatedotmeai.vercel.app",
};

describe("session origin", () => {
  it("allows the configured production origin", () => {
    assert.equal(
      isAllowedSessionOrigin("https://motivatedotmeai.vercel.app", null, prod),
      true
    );
  });

  it("rejects loopback in production", () => {
    assert.equal(
      isAllowedSessionOrigin("http://localhost:3000", null, prod),
      false
    );
  });

  it("rejects a production request with neither origin nor referer", () => {
    assert.equal(isAllowedSessionOrigin(null, null, prod), false);
  });

  it("rejects a foreign origin in production", () => {
    assert.equal(isAllowedSessionOrigin("https://evil.example", null, prod), false);
  });

  it("allows referer when origin is missing and the referer matches", () => {
    assert.equal(
      isAllowedSessionOrigin(
        null,
        "https://motivatedotmeai.vercel.app/dashboard",
        prod
      ),
      true
    );
  });

  it("allows localhost only outside production", () => {
    const dev = { nodeEnv: "development", appUrl: "https://motivatedotmeai.vercel.app" };
    assert.equal(isAllowedSessionOrigin("http://localhost:3000", null, dev), true);
    assert.equal(isAllowedSessionOrigin("http://127.0.0.1:3000", null, dev), true);
    assert.equal(isAllowedSessionOrigin("https://motivatedotmeai.vercel.app", null, dev), false);
  });
});
