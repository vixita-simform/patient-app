import { NOTIFICATION_GROUP, NOTIFICATION_TYPE, Strings } from '../../../../src/constants';
import {
  groupNotificationsByRecency,
  toTimeLabel
} from '../../../../src/screens/notifications/NotificationsScreenUtils';
import type { NotificationItem } from '../../../../src/types';

const { minAgoSuffix, hrAgoSuffix, yesterday } = Strings.NotificationsScreen;

// Thu 1 Oct 2026, 12:00 PM local.
const NOW = new Date(2026, 9, 1, 12, 0, 0, 0);

const item = (id: string, createdAt: Date): NotificationItem => ({
  id,
  type: NOTIFICATION_TYPE.queueUpdate,
  title: `Title ${id}`,
  subtitle: `Subtitle ${id}`,
  createdAt: createdAt.toISOString(),
  unread: false
});

const minutesBeforeNow = (minutes: number): Date => new Date(NOW.getTime() - minutes * 60 * 1000);

describe('groupNotificationsByRecency', () => {
  it('buckets by today / yesterday / this week / past, keeping source order', () => {
    const notifications = [
      item('today_late', minutesBeforeNow(1)),
      item('today_midnight', new Date(2026, 9, 1, 0, 0)),
      item('yesterday_late', new Date(2026, 8, 30, 23, 59)),
      item('yesterday_early', new Date(2026, 8, 30, 0, 0)),
      item('week_edge', new Date(2026, 8, 24, 0, 0)),
      item('past_edge', new Date(2026, 8, 23, 23, 59))
    ];
    const groups = groupNotificationsByRecency(notifications, NOW);
    expect(groups.map((group) => [group.id, group.notifications.map((n) => n.id)])).toEqual([
      [NOTIFICATION_GROUP.today, ['today_late', 'today_midnight']],
      [NOTIFICATION_GROUP.yesterday, ['yesterday_late', 'yesterday_early']],
      [NOTIFICATION_GROUP.thisWeek, ['week_edge']],
      [NOTIFICATION_GROUP.past, ['past_edge']]
    ]);
    expect(groups.map((group) => group.label)).toEqual([
      Strings.Common.today,
      Strings.NotificationsScreen.yesterday,
      Strings.NotificationsScreen.thisWeek,
      Strings.NotificationsScreen.past
    ]);
  });

  it('omits empty groups', () => {
    const groups = groupNotificationsByRecency(
      [item('a', minutesBeforeNow(5)), item('b', new Date(2026, 7, 1, 9, 0))],
      NOW
    );
    expect(groups.map((group) => group.id)).toEqual([
      NOTIFICATION_GROUP.today,
      NOTIFICATION_GROUP.past
    ]);
  });

  it('returns no groups for an empty list', () => {
    expect(groupNotificationsByRecency([], NOW)).toEqual([]);
  });
});

describe('toTimeLabel', () => {
  it.each([
    [0.5, `1 ${minAgoSuffix}`],
    [2, `2 ${minAgoSuffix}`],
    [59, `59 ${minAgoSuffix}`],
    [59.9, `59 ${minAgoSuffix}`],
    [60, `1 ${hrAgoSuffix}`],
    [119, `1 ${hrAgoSuffix}`],
    [180, `3 ${hrAgoSuffix}`]
  ])('labels %p minutes ago today as %p', (minutes, expected) => {
    expect(toTimeLabel(item('n', minutesBeforeNow(minutes)), NOW)).toBe(expected);
  });

  it('labels yesterday with the time', () => {
    expect(toTimeLabel(item('n', new Date(2026, 8, 30, 18, 40)), NOW)).toBe(
      `${yesterday}, 6:40 PM`
    );
  });

  it('labels this week and past with date and time', () => {
    expect(toTimeLabel(item('n', new Date(2026, 8, 24, 9, 5)), NOW)).toBe('Thu, 24 Sep, 9:05 AM');
    expect(toTimeLabel(item('n', new Date(2026, 7, 16, 16, 0)), NOW)).toBe('Sun, 16 Aug, 4:00 PM');
  });
});
