import type { TimeSlotStatus } from '../../constants';

export type { TimeSlotStatus };

/** One 30-minute bookable slot. */
export interface TimeSlot {
  /** 24h "HH:mm" key, stable across re-renders (e.g. "10:00"). */
  id: string;
  /** Display label, e.g. "10:00" or "1:30". */
  label: string;
  status: TimeSlotStatus;
}
