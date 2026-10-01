import type { ReactElement } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import {
  BellIcon,
  CalendarIcon,
  CardIcon,
  FileIcon,
  FlaskIcon,
  PillIcon,
} from "../../../../assets/icons";
import { CustomText } from "../../../../components";
import { NOTIFICATION_TYPE, Strings } from "../../../../constants";
import type { NotificationType } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import { Colors, scale } from "../../../../theme";
import NotificationRowStyles from "./NotificationRowStyles";
import type { NotificationRowProps, NotificationTypeMeta } from "./NotificationRowTypes";

/** Maps each notification type to its icon, icon-box tint and stroke colour. */
const NOTIFICATION_TYPE_META: Record<NotificationType, NotificationTypeMeta> = Object.freeze({
  [NOTIFICATION_TYPE.queueUpdate]: { Icon: BellIcon, boxStyleKey: "iconBoxGreen", iconColorKey: "green" },
  [NOTIFICATION_TYPE.labReport]: { Icon: FlaskIcon, boxStyleKey: "iconBoxBlue", iconColorKey: "blue" },
  [NOTIFICATION_TYPE.medicine]: { Icon: PillIcon, boxStyleKey: "iconBoxAmber", iconColorKey: "amberInk" },
  [NOTIFICATION_TYPE.appointment]: { Icon: CalendarIcon, boxStyleKey: "iconBoxGreen", iconColorKey: "green" },
  [NOTIFICATION_TYPE.billing]: { Icon: CardIcon, boxStyleKey: "iconBoxCoral", iconColorKey: "coral" },
  [NOTIFICATION_TYPE.insurance]: { Icon: FileIcon, boxStyleKey: "iconBoxBlue", iconColorKey: "blue" },
});

/**
 * One notification row: tinted icon box, title (+ unread dot), subtitle and
 * a trailing relative time label. Tapping the row marks it read.
 * @param {NotificationRowProps} props - the notification to render.
 * @returns {ReactElement} A React Element.
 */
const NotificationRow = ({ notification, onPress }: NotificationRowProps): ReactElement => {
  const { styles, theme } = useTheme(NotificationRowStyles);
  const meta = NOTIFICATION_TYPE_META[notification.type] ?? NOTIFICATION_TYPE_META[NOTIFICATION_TYPE.queueUpdate];
  const { Icon } = meta;
  const iconColor = Colors[theme][meta.iconColorKey];
  const accessibilityLabel = notification.unread
    ? `${notification.title}, ${Strings.NotificationsScreen.unread}`
    : notification.title;

  const handlePress = (): void => {
    onPress?.(notification.id);
  };

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={styles.row}
      onPress={handlePress}
    >
      <View style={StyleSheet.flatten([styles.iconBox, styles[meta.boxStyleKey]])}>
        <Icon color={iconColor} size={scale(20)} />
      </View>
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
