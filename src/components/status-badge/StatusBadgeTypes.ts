import type { StatusBadgeTone } from "../../constants";

export type { StatusBadgeTone };

export interface StatusBadgeProps {
  label: string;
  /** Pill colour. Defaults to green (e.g. "Confirmed"); amber suits "Pending". */
  tone?: StatusBadgeTone;
}
