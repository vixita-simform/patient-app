import type { AccessibilityState } from "react-native";

import type { NotificationRowData } from "./components";

/** One recency-bucketed group, with each notification's time label pre-formatted for display. */
export interface NotificationGroupViewData {
  id: string;
  label: string;
  notifications: readonly NotificationRowData[];
  /** Row press handler, carried on each group so the list's `renderItem` can stay module-level. */
  onPressNotification: (id: string) => void;
}

/** Hook return: grouped data plus the screen's press handlers. */
export interface UseNotificationsScreenReturn {
  groups: readonly NotificationGroupViewData[];
  hasUnread: boolean;
  /** Stable `{ disabled }` state for the "Mark all read" action. */
  markAllReadAccessibilityState: AccessibilityState;
  onPressBack: () => void;
  onPressMarkAllRead: () => void;
  onPressNotification: (id: string) => void;
}
