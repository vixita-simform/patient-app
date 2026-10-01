import type { NotificationRowData } from "./components";

/** One recency-bucketed group, with each notification's time label pre-formatted for display. */
export interface NotificationGroupViewData {
  id: string;
  label: string;
  notifications: readonly NotificationRowData[];
}

/** Hook return: grouped data plus the screen's press handlers. */
export interface UseNotificationsScreenReturn {
  groups: readonly NotificationGroupViewData[];
  hasUnread: boolean;
  onPressBack: () => void;
  onPressMarkAllRead: () => void;
  onPressNotification: (id: string) => void;
}
