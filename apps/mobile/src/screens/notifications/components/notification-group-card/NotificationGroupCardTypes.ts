import type { NotificationRowData } from '../notification-row';

export interface NotificationGroupCardProps {
  /** Group heading, e.g. "Today". */
  label: string;
  notifications: readonly NotificationRowData[];
  /** Called with a notification's id when its row is pressed (marks it read). */
  onPressNotification: (id: string) => void;
}
