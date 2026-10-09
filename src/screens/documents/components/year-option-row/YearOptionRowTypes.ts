export interface YearOptionRowProps {
  /** Text shown in the row (e.g. "All years" or "2024"). */
  label: string;
  /** Year value passed to `onSelect` (e.g. "All" or "2024"). */
  value: string;
  active: boolean;
  onSelect: (value: string) => void;
}
