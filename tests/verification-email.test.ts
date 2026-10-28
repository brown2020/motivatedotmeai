import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  readAuthErrorCode,
  sendWithContinueUrlFallback,
} from "../src/lib/verification-email.ts";

function codedError(code: string): Error {
  return Object.assign(new Error(code), { code });
}

describe("sendWithContinueUrlFallback", () => {
  it("sends with the continue URL when the host is authorized", async () => {
    const calls: Array<string | undefined> = [];
    await sendWithContinueUrlFallback("https://motivate.me/signin", async (settings) => {
      calls.push(settings?.url);
    });
    assert.deepEqual(calls, ["https://motivate.me/signin"]);
  });

  it("retries without a continue URL when a preview host is rejected", async () => {
    const preview = "https://motivatedotmeai-git-dev-team.vercel.app/signin";
    const calls: Array<string | undefined> = [];
    await sendWithContinueUrlFallback(preview, async (settings) => {
      calls.push(settings?.url);
      if (settings?.url) {
        throw codedError("auth/unauthorized-continue-uri");
      }
    });
    assert.deepEqual(calls, [preview, undefined]);
  });

  it("surfaces unrelated send failures instead of retrying", async () => {
    let calls = 0;
    await assert.rejects(
      () =>
        sendWithContinueUrlFallback("https://preview.vercel.app/signin", async () => {
          calls += 1;
          throw codedError("auth/too-many-requests");
        }),
      (error: unknown) => readAuthErrorCode(error) === "auth/too-many-requests"
    );
    assert.equal(calls, 1);
  });

  it("surfaces the retry error when sending without a continue URL also fails", async () => {
    const calls: Array<string | undefined> = [];
    await assert.rejects(
      () =>
        sendWithContinueUrlFallback("https://preview.vercel.app/signin", async (settings) => {
          calls.push(settings?.url);
          if (settings?.url) {
            throw codedError("auth/unauthorized-continue-uri");
          }
          throw codedError("auth/network-request-failed");
        }),
      (error: unknown) => readAuthErrorCode(error) === "auth/network-request-failed"
    );
    assert.deepEqual(calls, ["https://preview.vercel.app/signin", undefined]);
  });

  it("sends without settings when there is no continue URL", async () => {
    const calls: Array<string | undefined> = [];
    await sendWithContinueUrlFallback(undefined, async (settings) => {
      calls.push(settings?.url);
    });
    assert.deepEqual(calls, [undefined]);
  });
});
