export interface FilterChipProps {
  /** Text shown in the chip (e.g. "All" or "Tax Return"). */
  label: string;
  /** Filter value passed to `onSelect`. */
  value: string;
  active: boolean;
  onSelect: (value: string) => void;
}
