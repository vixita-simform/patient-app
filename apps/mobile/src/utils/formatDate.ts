import { Strings } from '../constants';

// Formatted by hand rather than via Intl: en-IN output differs across ICU versions
// ("Sept" vs "Sep", "am" vs "AM"), and we want identical output on iOS and Android.
const D = Strings.Dates;
export const WEEKDAYS: readonly string[] = Object.freeze([
  D.sun,
  D.mon,
  D.tue,
  D.wed,
  D.thu,
  D.fri,
  D.sat
]);
export const WEEKDAYS_LONG: readonly string[] = Object.freeze([
  D.sunday,
  D.monday,
  D.tuesday,
  D.wednesday,
  D.thursday,
  D.friday,
  D.saturday
]);
const MONTHS: readonly string[] = Object.freeze([
  D.jan,
  D.feb,
  D.mar,
  D.apr,
  D.may,
  D.jun,
  D.jul,
  D.aug,
  D.sep,
  D.oct,
  D.nov,
  D.dec
]);
export const MONTHS_LONG: readonly string[] = Object.freeze([
  D.january,
  D.february,
  D.march,
  D.april,
  D.mayLong,
  D.june,
  D.july,
  D.august,
  D.september,
  D.october,
  D.november,
  D.december
]);

type DateInput = Date | string | number;

const toDate = (value: DateInput): Date => (value instanceof Date ? value : new Date(value));

const isValidDate = (date: Date): boolean => !Number.isNaN(date.getTime());

/** e.g. "Tue, 29 Sep"; returns "" for an invalid date. */
export function formatDate(value: DateInput): string {
  const date = toDate(value);
  if (!isValidDate(date)) {
    return '';
  }
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** e.g. "14 Mar 1992"; returns "" for an invalid date. */
export function formatDateWithYear(value: DateInput): string {
  const date = toDate(value);
  if (!isValidDate(date)) {
    return '';
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

/** e.g. "Friday, 2 October" (for screen readers); returns "" for an invalid date. */
export function formatLongDate(value: DateInput): string {
  const date = toDate(value);
  if (!isValidDate(date)) {
    return '';
  }
  return `${WEEKDAYS_LONG[date.getDay()]}, ${date.getDate()} ${MONTHS_LONG[date.getMonth()]}`;
}

/** e.g. "Tue, 29 Sep, 11:30 AM"; returns "" for an invalid date. */
export function formatDateTime(value: DateInput): string {
  const date = toDate(value);
  if (!isValidDate(date)) {
    return '';
  }
  return `${formatDate(date)}, ${formatTime(date)}`;
}

/** "Today, 11:30 AM" when `value` is today, otherwise "Wed, 7 Oct, 10:00 AM"; "" when invalid. */
export function formatRelativeDateTime(value: DateInput, now: Date = new Date()): string {
  const date = toDate(value);
  if (!isValidDate(date)) {
    return '';
  }
  return isToday(date, now) ? `${Strings.Common.today}, ${formatTime(date)}` : formatDateTime(date);
}

/** e.g. "11:30 AM"; returns "" for an invalid date. */
export function formatTime(value: DateInput): string {
  const date = toDate(value);
  if (!isValidDate(date)) {
    return '';
  }
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours < 12 ? D.am : D.pm;
  return `${hours % 12 || 12}:${minutes} ${period}`;
}
