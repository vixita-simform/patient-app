import type { VisitMode } from "../../constants";

/** Visual/selection state of a single time slot. */
export type TimeSlotStatus = "available" | "selected" | "taken" | "past";

/** One 30-minute bookable slot. */
export interface TimeSlot {
  /** 24h "HH:mm" key, stable across re-renders (e.g. "10:00"). */
  id: string;
  /** Display label, e.g. "10:00" or "1:30". */
  label: string;
  status: TimeSlotStatus;
}

/** One selectable visit type ("In-person" / "Video call"). */
export type VisitTypeId = VisitMode;

/** One day cell in the horizontal date strip. */
export interface DateStripDay {
  /** ISO "YYYY-MM-DD" key. */
  id: string;
  weekday: string;
  dayNumber: string;
  /** Past day relative to "today", shown dimmed and disabled. */
  disabled: boolean;
  date: Date;
}
