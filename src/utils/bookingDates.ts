import { TIME_SLOT_STATUS } from "../constants";
import type { TimeSlot } from "../types";
import { isToday, WEEKDAYS } from "./formatDate";

// Formatted by hand for the same reason as formatDate: identical en-IN output on iOS and Android.
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Number of days shown in the horizontal date strip, starting a day before the centre date. */
const DATE_STRIP_DAYS = 6;
const DATE_STRIP_LEAD_DAYS = 1;
/** Booked-slot mock: every 3rd slot renders as taken, since there is no backend yet. */
const TAKEN_SLOT_INTERVAL = 3;
/** 30-minute slots, 10:00 AM through the last bookable start at 2:30 PM. */
const SLOT_START_HOUR = 10;
const SLOT_END_HOUR = 15;
const SLOT_STEP_MINUTES = 30;

/** One day cell in the horizontal date strip. */
export interface DateStripDay {
  /** Local-calendar "YYYY-MM-DD" key. */
  id: string;
  weekday: string;
  dayNumber: string;
  /** Past day relative to "today", shown dimmed and disabled. */
  disabled: boolean;
  date: Date;
}

const pad2 = (value: number): string => String(value).padStart(2, "0");

/** Local-calendar "YYYY-MM-DD" key; unlike `toISOString()` it never shifts the day by the UTC offset. */
export function toLocalDayId(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Midnight at the start of `date`'s local calendar day. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** e.g. "October 2026". */
export function formatMonthYear(date: Date): string {
  return `${MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}`;
}

/** Builds the 10:00-2:30 half-hour slot list, mocking every 3rd slot as taken and marking
 * any slot at or before `now` as past when `date` is today. Slots are never "selected" here:
 * selection is derived by the caller. */
export function buildTimeSlots(date: Date, now: Date): TimeSlot[] {
  const sameDay = isToday(date, now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const slots: TimeSlot[] = [];
  let index = 0;
  for (let hour = SLOT_START_HOUR; hour < SLOT_END_HOUR; hour += 1) {
    for (let minute = 0; minute < 60; minute += SLOT_STEP_MINUTES) {
      const totalMinutes = hour * 60 + minute;
      const isPast = sameDay && totalMinutes <= nowMinutes;
      const status = isPast
        ? TIME_SLOT_STATUS.past
        : (index + 1) % TAKEN_SLOT_INTERVAL === 0
          ? TIME_SLOT_STATUS.taken
          : TIME_SLOT_STATUS.available;
      slots.push({
        id: `${pad2(hour)}:${pad2(minute)}`,
        label: `${hour % 12 || 12}:${pad2(minute)}`,
        status,
      });
      index += 1;
    }
  }
  return slots;
}

/** Builds the horizontal date strip: `DATE_STRIP_LEAD_DAYS` before `centerDate`, rest after. */
export function buildDateStrip(centerDate: Date, today: Date): DateStripDay[] {
  const start = startOfDay(centerDate);
  start.setDate(start.getDate() - DATE_STRIP_LEAD_DAYS);
  const todayStart = startOfDay(today);

  return Array.from({ length: DATE_STRIP_DAYS }, (_, offset) => {
    const date = new Date(start);
    date.setDate(start.getDate() + offset);
    return {
      id: toLocalDayId(date),
      weekday: WEEKDAYS[date.getDay()],
      dayNumber: String(date.getDate()),
      disabled: date < todayStart,
      date,
    };
  });
}
