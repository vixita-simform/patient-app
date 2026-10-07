import type { DoseStatus } from '../../../../constants';

/** One dose chip, with its time and screen-reader label already formatted by the hook. */
export interface DoseChipData {
  id: string;
  status: DoseStatus;
  /** e.g. "8:00 AM". */
  timeLabel: string;
  /** Time plus status, e.g. "6:00 PM, Next dose", so status isn't conveyed by color alone. */
  accessibilityLabel: string;
}

export interface DoseTimelineProps {
  doses: readonly DoseChipData[];
}
