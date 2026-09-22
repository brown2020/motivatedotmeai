import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatDateKey,
  formatDisplayDate,
  isSameLocalDay,
  COPYRIGHT_YEAR,
} from "../src/lib/date-utils.ts";

describe("date-utils", () => {
  it("formats date keys stably", () => {
    assert.equal(formatDateKey(new Date(2026, 8, 22)), "2026-09-22");
  });

  it("formats display dates with en-US/UTC", () => {
    const out = formatDisplayDate("2026-06-20T12:00:00.000Z");
    assert.match(out, /2026/);
  });

  it("compares local calendar days", () => {
    const a = new Date(2026, 8, 22, 1);
    const b = new Date(2026, 8, 22, 23);
    assert.equal(isSameLocalDay(a, b), true);
  });

  it("exposes a static copyright year", () => {
    assert.equal(typeof COPYRIGHT_YEAR, "number");
  });
});
