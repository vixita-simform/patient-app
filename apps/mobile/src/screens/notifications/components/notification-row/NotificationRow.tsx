import type { ReactElement } from 'react';
import { useCallback } from 'react';
import { Pressable, View } from 'react-native';

import {
  BellIcon,
  CalendarIcon,
  CardIcon,
  FileIcon,
  FlaskIcon,
  PillIcon
} from '../../../../assets/icons';
import { CustomText, IconBox } from '../../../../components';
import { ICON_TONE, NOTIFICATION_TYPE, Strings } from '../../../../constants';
import type { NotificationType } from '../../../../constants';
import { useTheme } from '../../../../hooks';
import NotificationRowStyles from './NotificationRowStyles';
import type { NotificationRowProps, NotificationTypeMeta } from './NotificationRowTypes';

/** Maps each notification type to its icon and icon-box tone. */
const NOTIFICATION_TYPE_META: Record<NotificationType, NotificationTypeMeta> = Object.freeze({
  [NOTIFICATION_TYPE.queueUpdate]: { Icon: BellIcon, tone: ICON_TONE.green },
  [NOTIFICATION_TYPE.labReport]: { Icon: FlaskIcon, tone: ICON_TONE.blue },
  [NOTIFICATION_TYPE.medicine]: { Icon: PillIcon, tone: ICON_TONE.amber },
  [NOTIFICATION_TYPE.appointment]: { Icon: CalendarIcon, tone: ICON_TONE.green },
  [NOTIFICATION_TYPE.billing]: { Icon: CardIcon, tone: ICON_TONE.coral },
  [NOTIFICATION_TYPE.insurance]: { Icon: FileIcon, tone: ICON_TONE.blue }
});

/**
 * One notification row: tinted icon box, title (+ unread dot), subtitle and
 * a trailing relative time label. Tapping the row marks it read.
 * @param {NotificationRowProps} props - the notification to render.
 * @returns {ReactElement} A React Element.
 */
const NotificationRow = ({ notification, onPress }: NotificationRowProps): ReactElement => {
  const { styles } = useTheme(NotificationRowStyles);
  const meta =
    NOTIFICATION_TYPE_META[notification.type] ??
    NOTIFICATION_TYPE_META[NOTIFICATION_TYPE.queueUpdate];
  const accessibilityLabel = notification.unread
    ? `${notification.title}, ${Strings.NotificationsScreen.unread}`
    : notification.title;

  const handlePress = useCallback((): void => {
    onPress?.(notification.id);
  }, [notification.id, onPress]);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={styles.row}
      onPress={handlePress}
    >
      <IconBox Icon={meta.Icon} tone={meta.tone} />
      <View style={styles.text}>
        <View style={styles.titleRow}>
          <CustomText style={styles.title}>{notification.title}</CustomText>
          {notification.unread ? <View style={styles.unreadDot} /> : null}
        </View>
        <CustomText style={styles.subtitle}>{notification.subtitle}</CustomText>
        <CustomText style={styles.time}>{notification.timeLabel}</CustomText>
      </View>
    </Pressable>
  );
};

export default NotificationRow;
