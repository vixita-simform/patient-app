export interface DateChipProps {
  /** Local "YYYY-MM-DD" day key, passed back to `onPress`. */
  id: string;
  weekday: string;
  /** Full date for screen readers, e.g. "Friday, 2 October". */
  accessibilityLabel: string;
  dayNumber: string;
  active: boolean;
  disabled: boolean;
  onPress: (id: string) => void;
}
