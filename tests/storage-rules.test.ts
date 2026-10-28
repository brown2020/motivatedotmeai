import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("storage rules", () => {
  const rules = readFileSync(join(process.cwd(), "storage.rules"), "utf8");

  it("allows the owner to delete without a request.resource size check", () => {
    assert.match(rules, /allow delete: if isOwner\(userId\);/);
    assert.doesNotMatch(rules, /allow write:/);
  });

  it("accepts only raster image content types", () => {
    assert.match(rules, /image\/\(jpeg\|png\|webp\|gif\)/);
    assert.doesNotMatch(rules, /image\/\.\*/);
  });
});
