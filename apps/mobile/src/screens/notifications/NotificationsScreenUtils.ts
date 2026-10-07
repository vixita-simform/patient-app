import { NOTIFICATION_GROUP, Strings } from '../../constants';
import type { NotificationGroupId } from '../../constants';
import type { NotificationGroup, NotificationItem } from '../../types';
import { formatDate, formatTime, isThisWeek, isToday, isYesterday } from '../../utils';

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

const GROUP_LABELS: Record<NotificationGroupId, string> = Object.freeze({
  [NOTIFICATION_GROUP.today]: Strings.Common.today,
  [NOTIFICATION_GROUP.yesterday]: Strings.NotificationsScreen.yesterday,
  [NOTIFICATION_GROUP.thisWeek]: Strings.NotificationsScreen.thisWeek,
  [NOTIFICATION_GROUP.past]: Strings.NotificationsScreen.past
});

/**
 * Buckets a flat notification list into recency groups (Today / Yesterday /
 * This Week / Past), each keeping the source order. Groups with zero
 * notifications are omitted so no empty section header ever renders.
 * @param {readonly NotificationItem[]} notifications - the flat notification list.
 * @param {Date} [now] - reference "now", overridable for tests.
 * @returns {NotificationGroup[]} non-empty recency groups, in display order.
 */
export function groupNotificationsByRecency(
  notifications: readonly NotificationItem[],
  now: Date = new Date()
): NotificationGroup[] {
  const buckets: Record<NotificationGroupId, NotificationItem[]> = {
    [NOTIFICATION_GROUP.today]: [],
    [NOTIFICATION_GROUP.yesterday]: [],
    [NOTIFICATION_GROUP.thisWeek]: [],
    [NOTIFICATION_GROUP.past]: []
  };

  notifications.forEach((notification) => {
    if (isToday(notification.createdAt, now)) {
      buckets[NOTIFICATION_GROUP.today].push(notification);
    } else if (isYesterday(notification.createdAt, now)) {
      buckets[NOTIFICATION_GROUP.yesterday].push(notification);
    } else if (isThisWeek(notification.createdAt, now)) {
      buckets[NOTIFICATION_GROUP.thisWeek].push(notification);
    } else {
      buckets[NOTIFICATION_GROUP.past].push(notification);
    }
  });

  return Object.values(NOTIFICATION_GROUP)
    .map((id) => ({ id, label: GROUP_LABELS[id], notifications: buckets[id] }))
    .filter((group) => group.notifications.length > 0);
}

/**
 * Trailing time label for a notification row: relative for Today ("2 min ago",
 * "1 hr ago"; whole units, floored), "Yesterday, h:mm AM" for Yesterday, and
 * "Tue, 29 Sep, h:mm AM" for anything older.
 * @param {NotificationItem} notification - the notification to label.
 * @param {Date} now - reference "now".
 * @returns {string} the row's trailing time label.
 */
export function toTimeLabel(notification: NotificationItem, now: Date): string {
  const createdAt = new Date(notification.createdAt);
  if (isToday(createdAt, now)) {
    const elapsedMs = now.getTime() - createdAt.getTime();
    if (elapsedMs < HOUR_MS) {
      const minutes = Math.max(1, Math.floor(elapsedMs / MINUTE_MS));
      return `${minutes} ${Strings.NotificationsScreen.minAgoSuffix}`;
    }
    const hours = Math.floor(elapsedMs / HOUR_MS);
    return `${hours} ${Strings.NotificationsScreen.hrAgoSuffix}`;
  }
  if (isYesterday(createdAt, now)) {
    return `${Strings.NotificationsScreen.yesterday}, ${formatTime(createdAt)}`;
  }
  return `${formatDate(createdAt)}, ${formatTime(createdAt)}`;
}
