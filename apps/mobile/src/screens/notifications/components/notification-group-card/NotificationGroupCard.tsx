import type { ReactElement } from "react";
import { Fragment } from "react";
import { View } from "react-native";

import { CustomText } from "../../../../components";
import { useTheme } from "../../../../hooks";
import { NotificationRow } from "../notification-row";
import NotificationGroupCardStyles from "./NotificationGroupCardStyles";
import type { NotificationGroupCardProps } from "./NotificationGroupCardTypes";

/**
 * One recency group: its heading over a card of notification rows split by dividers.
 * @param {NotificationGroupCardProps} props - heading, rows and row press handler.
 * @returns {ReactElement} A React Element.
 */
const NotificationGroupCard = ({
  label,
  notifications,
  onPressNotification,
}: NotificationGroupCardProps): ReactElement => {
  const { styles } = useTheme(NotificationGroupCardStyles);

  return (
    <View style={styles.group}>
      <CustomText accessibilityRole="header" style={styles.groupLabel}>
        {label}
      </CustomText>
      <View style={styles.card}>
        {notifications.map((notification, index) => (
          <Fragment key={notification.id}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <NotificationRow notification={notification} onPress={onPressNotification} />
          </Fragment>
        ))}
      </View>
    </View>
  );
};

export default NotificationGroupCard;
