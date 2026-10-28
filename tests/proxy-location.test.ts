import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

describe("proxy location", () => {
  it("lives beside src/app so Next.js registers it", () => {
    assert.equal(existsSync(join(process.cwd(), "src/proxy.ts")), true);
    assert.equal(existsSync(join(process.cwd(), "proxy.ts")), false);
    const src = readFileSync(join(process.cwd(), "src/proxy.ts"), "utf8");
    assert.match(src, /export default function proxy/);
    assert.match(src, /PROTECTED_PREFIXES/);
  });
});
