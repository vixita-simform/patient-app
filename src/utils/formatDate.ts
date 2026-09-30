// Formatted by hand rather than via Intl: en-IN output differs across ICU versions
// ("Sept" vs "Sep", "am" vs "AM"), and we want identical output on iOS and Android.
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

/** True when `value` falls on the same calendar day as `now`. */
export function isToday(value: DateInput, now: Date = new Date()): boolean {
  return toDate(value).toDateString() === now.toDateString();
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
