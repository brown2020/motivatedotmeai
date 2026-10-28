import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatDateKey,
  formatDisplayDate,
  formatDisplayDateTime,
  formatDueDate,
  isDateInput,
  isSameLocalDay,
  parseDateKey,
  calendarDaysRemaining,
  COPYRIGHT_YEAR,
} from "../src/lib/date-utils.ts";

describe("date-utils", () => {
  it("formats date keys stably", () => {
    assert.equal(formatDateKey(new Date(2026, 8, 22)), "2026-09-22");
  });

  it("parses a date input as that local calendar day", () => {
    const date = parseDateKey("2026-10-28");
    assert.equal(formatDateKey(date), "2026-10-28");
    assert.equal(date.getHours(), 0);
  });

  it("rejects overflow dates", () => {
    assert.equal(isDateInput("2026-02-31"), false);
    assert.equal(isDateInput("2026-10-28"), true);
  });

  it("formats display dates in the local calendar, including late evening", () => {
    const evening = new Date(2026, 5, 20, 23, 30);
    assert.equal(formatDisplayDate(evening), "Jun 20, 2026");
    assert.match(formatDisplayDateTime(evening), /Jun 20, 2026/);
  });

  it("keeps legacy UTC-midnight due dates on that UTC calendar day", () => {
    assert.equal(formatDueDate(new Date("2026-10-28T00:00:00.000Z")), "Oct 28, 2026");
  });

  it("counts a due date of today as zero days remaining", () => {
    const today = new Date(2026, 9, 28, 15, 0);
    const due = parseDateKey("2026-10-28");
    assert.equal(calendarDaysRemaining(due, today), 0);
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
