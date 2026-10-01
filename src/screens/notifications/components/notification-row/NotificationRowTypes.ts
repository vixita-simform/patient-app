import type { Notification } from "../../../../types";

/** A `Notification` plus its pre-formatted relative/absolute time label for display. */
export interface NotificationRowData extends Notification {
  timeLabel: string;
}

export interface NotificationRowProps {
  notification: NotificationRowData;
  /** Called with the notification's id when the row is pressed (marks it read). */
  onPress?: (id: string) => void;
}
