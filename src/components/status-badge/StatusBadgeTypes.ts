export type StatusBadgeTone = "green" | "amber" | "coral";

export interface StatusBadgeProps {
  label: string;
  /** Pill colour. Defaults to green (e.g. "Confirmed"); amber suits "Pending". */
  tone?: StatusBadgeTone;
}
