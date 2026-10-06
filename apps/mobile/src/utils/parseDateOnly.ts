/**
 * Parses a "YYYY-MM-DD" calendar date as local midnight. `new Date("YYYY-MM-DD")` would
 * parse it as UTC and shift the day in time zones west of UTC.
 * @param {string} value - calendar date, "YYYY-MM-DD".
 * @returns {Date} local midnight of that day (an invalid Date when the format is wrong).
 */
export function parseDateOnly(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : new Date(NaN);
}
