/** Props for `CalendarModal`, the iOS date-picker bottom sheet. */
export interface CalendarModalProps {
  visible: boolean;
  selectedDate: Date;
  /** Earliest selectable date, passed through as the picker's `minimumDate`. */
  minimumDate: Date;
  onChange: (event: unknown, date?: Date) => void;
  onDismiss: () => void;
}
