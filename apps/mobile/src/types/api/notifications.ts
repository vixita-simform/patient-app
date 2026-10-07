import type { NotificationType } from '../../constants';

/** One notification row, as returned by the API (flat, ungrouped). */
export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  subtitle: string;
  createdAt: string;
  unread: boolean;
}

/** A recency-bucketed group of notifications ("Today", "Yesterday", ...), built client-side. */
export interface NotificationGroup {
  id: string;
  label: string;
  notifications: readonly NotificationItem[];
}

/** API response shape for Notifications (GET /patients/me/notifications). */
export interface NotificationListResponse {
  notifications: readonly NotificationItem[];
}
