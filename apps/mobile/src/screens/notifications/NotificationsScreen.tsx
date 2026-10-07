import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import type { ListRenderItem } from 'react-native';

import { CustomText, Screen, ScreenHeader } from '../../components';
import { SCREEN_HEADER_VARIANT, Strings } from '../../constants';
import { useTheme } from '../../hooks';
import { scale } from '../../theme';
import { NotificationGroupCard } from './components';
import NotificationsScreenStyles from './NotificationsScreenStyles';
import type { NotificationGroupViewData } from './NotificationsScreenTypes';
import useNotificationsScreen from './useNotificationsScreen';

/** Grows the text-sized "Mark all read" action to at least a 44pt target. */
const ACTION_HIT_SLOP = scale(12);

const keyExtractor = (group: NotificationGroupViewData): string => group.id;

const renderGroup: ListRenderItem<NotificationGroupViewData> = ({ item }) => (
  <NotificationGroupCard
    label={item.label}
    notifications={item.notifications}
    onPressNotification={item.onPressNotification}
  />
);

/**
 * Notifications screen: header (back button, title, "Mark all read" action),
 * then a scrollable list of recency-grouped notification cards (Today /
 * Yesterday / This Week / Past). Reached from the Home screen's bell icon.
 * Static dummy data stands in for the API — see `useNotificationsScreen`.
 * @returns {ReactElement} A React Element.
 */
export default function NotificationsScreen(): ReactElement {
  const { styles } = useTheme(NotificationsScreenStyles);
  const { groups, hasUnread, markAllReadAccessibilityState, onPressBack, onPressMarkAllRead } =
    useNotificationsScreen();
  const markAllReadTextStyle = useMemo(
    () =>
      hasUnread
        ? styles.markAllRead
        : StyleSheet.flatten([styles.markAllRead, styles.markAllReadDisabled]),
    [styles, hasUnread]
  );

  return (
    <Screen>
      <View style={styles.screen}>
        <ScreenHeader
          right={
            <Pressable
              accessibilityLabel={Strings.NotificationsScreen.markAllRead}
              accessibilityRole="button"
              accessibilityState={markAllReadAccessibilityState}
              disabled={!hasUnread}
              hitSlop={ACTION_HIT_SLOP}
              onPress={onPressMarkAllRead}
            >
              <CustomText style={markAllReadTextStyle}>
                {Strings.NotificationsScreen.markAllRead}
              </CustomText>
            </Pressable>
          }
          title={Strings.Common.notifications}
          variant={SCREEN_HEADER_VARIANT.large}
          onBackPress={onPressBack}
        />
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
