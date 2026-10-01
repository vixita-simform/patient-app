import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";

import { getNotificationsDummyData } from "../../constants";
import type { NotificationItem } from "../../types";
import type { NotificationGroupViewData, UseNotificationsScreenReturn } from "./NotificationsScreenTypes";
import { groupNotificationsByRecency, toTimeLabel } from "./NotificationsScreenUtils";

/**
 * Notifications screen state: buckets the flat dummy notification list into
 * recency groups, tracks per-notification read state locally, and exposes
 * the header/row press handlers. No pagination/loading/empty UI — static
 * data only, per the design (no reference exists for those states).
 * @returns {UseNotificationsScreenReturn} grouped notifications and handlers.
 */
const useNotificationsScreen = (): UseNotificationsScreenReturn => {
  // Lazy initializer: timestamps are generated relative to when the screen mounts.
  const [notifications, setNotifications] = useState<readonly NotificationItem[]>(
    getNotificationsDummyData,
  );
  // Reference "now" for bucketing and relative labels; refreshed on every focus so
  // returning to the screen does not show stale "2 min ago" labels.
  const [now, setNow] = useState(() => new Date());

  useFocusEffect(
    useCallback(() => {
      setNow(new Date());
    }, []),
  );

  const onPressBack = useCallback(() => {
    router.back();
  }, []);

  const onPressMarkAllRead = useCallback(() => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, unread: false })),
    );
  }, []);

  const onPressNotification = useCallback((id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, unread: false } : notification,
      ),
    );
  }, []);

  const groups = useMemo<readonly NotificationGroupViewData[]>(
    () =>
      groupNotificationsByRecency(notifications, now).map((group) => ({
        id: group.id,
        label: group.label,
        notifications: group.notifications.map((notification) => ({
          ...notification,
          timeLabel: toTimeLabel(notification, now),
        })),
      })),
    [notifications, now],
  );

  const hasUnread = useMemo(
    () => notifications.some((notification) => notification.unread),
    [notifications],
  );

  const markAllReadAccessibilityState = useMemo(() => ({ disabled: !hasUnread }), [hasUnread]);

  return {
    groups,
    hasUnread,
    markAllReadAccessibilityState,
    onPressBack,
    onPressMarkAllRead,
    onPressNotification,
  };
};

export default useNotificationsScreen;
