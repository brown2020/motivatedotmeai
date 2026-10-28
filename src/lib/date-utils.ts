/**
 * Check if two dates are on the same local calendar day.
 */
export function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Format a date as YYYY-MM-DD for use as a dateKey.
 */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Parse a YYYY-MM-DD dateKey into a Date at midnight local time.
 * Date-only form values must use this. `new Date("YYYY-MM-DD")` is UTC midnight,
 * which is already in the past on the same calendar day west of UTC.
 */
export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map((n) => Number(n));
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) {
    return new Date(NaN);
  }
  const date = new Date(y, m - 1, d);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** True when value is a real YYYY-MM-DD calendar date (no overflow). */
export function isDateInput(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = parseDateKey(value);
  return !Number.isNaN(date.getTime()) && formatDateKey(date) === value;
}

/** Local midnight for the calendar day containing `date`. */
export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Whole local calendar days from today until `endDate` (negative when overdue). */
export function calendarDaysRemaining(endDate: Date, now = new Date()): number {
  const ms = startOfLocalDay(endDate).getTime() - startOfLocalDay(now).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function toDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value);
}

function isUtcMidnight(date: Date): boolean {
  return (
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0
  );
}

/**
 * Calendar date in the runtime's local timezone.
 * Habit completions are instants and must use this, or an evening check-in
 * west of UTC renders as the next day.
 */
export function formatDisplayDate(value: Date | string | number): string {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Due dates picked from a date input.
 * Older rows were stored as UTC midnight (`new Date("YYYY-MM-DD")`). Newer rows
 * are local midnight. UTC midnight is shown as that UTC calendar day so existing
 * goals do not shift; every other instant uses the local calendar day.
 */
export function formatDueDate(value: Date | string | number): string {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return "";
  if (!isUtcMidnight(date)) return formatDisplayDate(date);
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

/** Local date and time. Hours are 12-hour so the string does not depend on Intl. */
export function formatDisplayDateTime(value: Date | string | number): string {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return "";
  const hours24 = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const suffix = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${formatDisplayDate(date)}, ${hours12}:${minutes} ${suffix}`;
}

/** Static copyright year for SSR-safe footers (avoid new Date() in JSX). */
export const COPYRIGHT_YEAR = 2026;

/** Legal pages "last updated" stamp — fixed string, not runtime Date. */
export const LEGAL_LAST_UPDATED = "June 20, 2026";
