import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";

import { notificationsDummyData, Strings } from "../../constants";
import type { Notification, NotificationGroup } from "../../types";
import { formatTime, isThisWeek, isToday, isYesterday } from "../../utils";
import type { NotificationGroupViewData, UseNotificationsScreenReturn } from "./NotificationsScreenTypes";

/** Recency bucket ids, in display order. */
const GROUP_ID = Object.freeze({
  today: "today",
  yesterday: "yesterday",
  thisWeek: "thisWeek",
  past: "past",
} as const);

/**
 * Buckets a flat notification list into recency groups (Today / Yesterday /
 * This Week / Past), each keeping the source order. Groups with zero
 * notifications are omitted so no empty section header ever renders.
 * @param {readonly Notification[]} notifications - the flat notification list.
 * @param {Date} [now] - reference "now", overridable for tests.
 * @returns {NotificationGroup[]} non-empty recency groups, in display order.
 */
export function groupNotificationsByRecency(
  notifications: readonly Notification[],
  now: Date = new Date(),
): NotificationGroup[] {
  const buckets: Record<string, Notification[]> = {
    [GROUP_ID.today]: [],
    [GROUP_ID.yesterday]: [],
    [GROUP_ID.thisWeek]: [],
    [GROUP_ID.past]: [],
  };

  notifications.forEach((notification) => {
    if (isToday(notification.createdAt, now)) {
      buckets[GROUP_ID.today].push(notification);
    } else if (isYesterday(notification.createdAt, now)) {
      buckets[GROUP_ID.yesterday].push(notification);
    } else if (isThisWeek(notification.createdAt, now)) {
      buckets[GROUP_ID.thisWeek].push(notification);
    } else {
      buckets[GROUP_ID.past].push(notification);
    }
  });

  const labels: Record<string, string> = {
    [GROUP_ID.today]: Strings.NotificationsScreen.today,
    [GROUP_ID.yesterday]: Strings.NotificationsScreen.yesterday,
    [GROUP_ID.thisWeek]: Strings.NotificationsScreen.thisWeek,
    [GROUP_ID.past]: Strings.NotificationsScreen.past,
  };

  return Object.values(GROUP_ID)
    .map((id) => ({ id, label: labels[id], notifications: buckets[id] }))
    .filter((group) => group.notifications.length > 0);
}

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

/**
 * Relative time label for a Today notification ("2 min ago", "1 hr ago"),
 * or an absolute "Yesterday, h:mm AM/PM" style label otherwise.
 * @param {Notification} notification - the notification to label.
 * @param {Date} now - reference "now".
 * @returns {string} the row's trailing time label.
 */
function toTimeLabel(notification: Notification, now: Date): string {
  const createdAt = new Date(notification.createdAt);
  if (isToday(createdAt, now)) {
    const elapsedMs = now.getTime() - createdAt.getTime();
    if (elapsedMs < HOUR_MS) {
      const minutes = Math.max(1, Math.round(elapsedMs / MINUTE_MS));
      return `${minutes} ${Strings.NotificationsScreen.minAgoSuffix}`;
    }
    const hours = Math.round(elapsedMs / HOUR_MS);
    return `${hours} ${Strings.NotificationsScreen.hrAgoSuffix}`;
  }
  if (isYesterday(createdAt, now)) {
    return `${Strings.NotificationsScreen.yesterday}, ${formatTime(createdAt)}`;
  }
  return formatTime(createdAt);
}

/**
 * Notifications screen state: buckets the flat dummy notification list into
 * recency groups, tracks per-notification read state locally, and exposes
 * the header/row press handlers. No pagination/loading/empty UI — static
 * data only, per the design (no reference exists for those states).
 * @returns {UseNotificationsScreenReturn} grouped notifications and handlers.
 */
const useNotificationsScreen = (): UseNotificationsScreenReturn => {
  const [notifications, setNotifications] = useState<readonly Notification[]>(
    notificationsDummyData,
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

  const groups = useMemo<readonly NotificationGroupViewData[]>(() => {
    const now = new Date();
    return groupNotificationsByRecency(notifications, now).map((group) => ({
      id: group.id,
      label: group.label,
      notifications: group.notifications.map((notification) => ({
        ...notification,
        timeLabel: toTimeLabel(notification, now),
      })),
    }));
  }, [notifications]);

  const hasUnread = useMemo(
    () => notifications.some((notification) => notification.unread),
    [notifications],
  );

  return { groups, hasUnread, onPressBack, onPressMarkAllRead, onPressNotification };
};

export default useNotificationsScreen;
