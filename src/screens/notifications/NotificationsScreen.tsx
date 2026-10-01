import type { ReactElement } from "react";
import { Fragment } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { BackIcon } from "../../assets/icons";
import { CustomText, IconButton, Screen } from "../../components";
import { Strings } from "../../constants";
import { useTheme } from "../../hooks";
import { Colors, scale } from "../../theme";
import { NotificationRow } from "./components";
import NotificationsScreenStyles from "./NotificationsScreenStyles";
import type { NotificationGroupViewData } from "./NotificationsScreenTypes";
import useNotificationsScreen from "./useNotificationsScreen";

const keyExtractor = (group: NotificationGroupViewData): string => group.id;

/**
 * Notifications screen: header (back button, title, "Mark all read" action),
 * then a scrollable list of recency-grouped notification cards (Today /
 * Yesterday / This Week / Past). Reached from the Home screen's bell icon.
 * Static dummy data stands in for the API — see `useNotificationsScreen`.
 * @returns {ReactElement} A React Element.
 */
export default function NotificationsScreen(): ReactElement {
  const { styles, theme } = useTheme(NotificationsScreenStyles);
  const {
    groups,
    hasUnread,
    markAllReadAccessibilityState,
    onPressBack,
    onPressMarkAllRead,
    onPressNotification,
  } = useNotificationsScreen();

  const renderGroup = ({ item }: { item: NotificationGroupViewData }): ReactElement => (
    <View style={styles.group}>
      <CustomText style={styles.groupLabel}>{item.label}</CustomText>
      <View style={styles.card}>
        {item.notifications.map((notification, index) => (
          <Fragment key={notification.id}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <NotificationRow notification={notification} onPress={onPressNotification} />
          </Fragment>
        ))}
      </View>
    </View>
  );

  return (
    <Screen>
      <View style={styles.screen}>
        <View style={styles.header}>
          <IconButton accessibilityLabel={Strings.Common.back} onPress={onPressBack}>
            <BackIcon color={Colors[theme].navy} size={scale(20)} />
          </IconButton>
          <CustomText style={styles.headerTitle}>{Strings.NotificationsScreen.title}</CustomText>
          <CustomText
            accessibilityRole="button"
            accessibilityState={markAllReadAccessibilityState}
            disabled={!hasUnread}
            style={StyleSheet.flatten([styles.markAllRead, !hasUnread && styles.markAllReadDisabled])}
            onPress={onPressMarkAllRead}
          >
            {Strings.NotificationsScreen.markAllRead}
          </CustomText>
        </View>
        <FlatList
          contentContainerStyle={styles.bodyContent}
          data={groups}
          keyExtractor={keyExtractor}
          renderItem={renderGroup}
          showsVerticalScrollIndicator={false}
          style={styles.body}
        />
      </View>
    </Screen>
  );
}
