/** Props for `CalendarModal`, the iOS date-picker bottom sheet. */
export interface CalendarModalProps {
  visible: boolean;
  /** Date the picker opens on; edits stay local until Done. */
  selectedDate: Date;
  /** Earliest selectable date, passed through as the picker's `minimumDate`. */
  minimumDate?: Date;
  /** Latest selectable date, passed through as the picker's `maximumDate`. */
  maximumDate?: Date;
  /** Done: commits the picked date. */
  onConfirm: (date: Date) => void;
  /** Cancel, backdrop tap or hardware back: closes without changing the date. */
  onDismiss: () => void;
}
