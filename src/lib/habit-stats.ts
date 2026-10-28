function localDayTime(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function shiftLocalDay(dayTime: number, deltaDays: number): number {
  const next = new Date(dayTime);
  next.setDate(next.getDate() + deltaDays);
  return next.getTime();
}

function uniqueLocalDays(dates: readonly Date[]): number[] {
  return [...new Set(dates.map((date) => localDayTime(date)))].sort((a, b) => a - b);
}

/**
 * Consecutive local days ending today, or ending yesterday when today is still open.
 * Multiple completions on the same day count once.
 */
export function currentCompletionStreak(
  dates: readonly Date[],
  now = new Date()
): number {
  const days = new Set(uniqueLocalDays(dates));
  let cursor = localDayTime(now);
  if (!days.has(cursor)) cursor = shiftLocalDay(cursor, -1);

  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = shiftLocalDay(cursor, -1);
  }
  return streak;
}

/** Longest run of consecutive local days. Same-day completions count once. */
export function longestCompletionStreak(dates: readonly Date[]): number {
  const days = uniqueLocalDays(dates);
  let longest = 0;
  let run = 0;
  let previous: number | null = null;

  for (const day of days) {
    if (previous !== null && day === shiftLocalDay(previous, 1)) run += 1;
    else run = 1;
    previous = day;
    longest = Math.max(longest, run);
  }

  return longest;
}

/** Unique local days on or after the local midnight of `since`. */
export function countCompletionDaysSince(
  dates: readonly Date[],
  since: Date
): number {
  const start = localDayTime(since);
  return uniqueLocalDays(dates).filter((day) => day >= start).length;
}

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** Weekday with the most distinct completion days, or null when there are none. */
export function bestCompletionWeekday(dates: readonly Date[]): string | null {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const day of uniqueLocalDays(dates)) {
    counts[new Date(day).getDay()] += 1;
  }
  const best = Math.max(...counts);
  if (best === 0) return null;
  return WEEKDAYS[counts.indexOf(best)] ?? null;
}
