export interface DateChipProps {
  /** Local "YYYY-MM-DD" day key, passed back to `onPress`. */
  id: string;
  weekday: string;
  dayNumber: string;
  active: boolean;
  disabled: boolean;
  onPress: (id: string) => void;
}
