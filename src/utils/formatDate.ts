// Formatted by hand rather than via Intl: en-IN output differs across ICU versions
// ("Sept" vs "Sep", "am" vs "AM"), and we want identical output on iOS and Android.
export const WEEKDAYS: readonly string[] = Object.freeze(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
const MONTHS: readonly string[] = Object.freeze(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]);

type DateInput = Date | string | number;

const toDate = (value: DateInput): Date => (value instanceof Date ? value : new Date(value));

const isValidDate = (date: Date): boolean => !Number.isNaN(date.getTime());

/** e.g. "Tue, 29 Sep"; returns "" for an invalid date. */
export function formatDate(value: DateInput): string {
  const date = toDate(value);
  if (!isValidDate(date)) {
    return "";
  }
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** e.g. "14 Mar 1992"; returns "" for an invalid date. */
export function formatDateWithYear(value: DateInput): string {
  const date = toDate(value);
  if (!isValidDate(date)) {
    return "";
  }
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** True when `value` falls on the same calendar day as `now`. */
export function isToday(value: DateInput, now: Date = new Date()): boolean {
  return toDate(value).toDateString() === now.toDateString();
}

/** True when `value` falls on the calendar day immediately before `now`. */
export function isYesterday(value: DateInput, now: Date = new Date()): boolean {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return toDate(value).toDateString() === yesterday.toDateString();
}

/** True when `value` is not today or yesterday, but within the last 7 calendar days. */
export function isThisWeek(value: DateInput, now: Date = new Date()): boolean {
  const date = toDate(value);
  if (!isValidDate(date) || isToday(date, now) || isYesterday(date, now)) {
    return false;
  }
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);
  return date.getTime() >= weekAgo.getTime() && date.getTime() <= now.getTime();
}

/** e.g. "11:30 AM"; returns "" for an invalid date. */
export function formatTime(value: DateInput): string {
  const date = toDate(value);
  if (!isValidDate(date)) {
    return "";
  }
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours < 12 ? "AM" : "PM";
  return `${hours % 12 || 12}:${minutes} ${period}`;
}
