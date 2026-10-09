import type { ReactElement } from "react";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { TeamIcon } from "../../../../assets/icons";
import { AppText, Avatar, Card } from "../../../../components";
import { CURRENT_USER_NAME, Strings } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import { scale, themes } from "../../../../theme";
import { getInitials, isGroupThread } from "../../../../utils";
import GroupAvatar from "../group-avatar/GroupAvatar";
import ThreadCardStyles from "./ThreadCardStyles";
import type { ThreadCardProps } from "./ThreadCardTypes";

const AVATAR_SIZE = 38;
const GROUP_ICON_SIZE = 17;
const COUNT_ICON_SIZE = scale(9);

/**
 * Thread list card: avatar, topic, sender line, preview and unread/closed marker.
 * @param {ThreadCardProps} props - thread data and press handler.
 * @returns {ReactElement} A React Element.
 */
const ThreadCard = ({ thread, onPress }: ThreadCardProps): ReactElement => {
  const { styles, theme } = useTheme(ThreadCardStyles);
  const { colors } = themes[theme];
  const { closed, unread, participants } = thread;
  const isGroup = isGroupThread(thread);
  const fromText = isGroup
    ? participants
        .filter((p) => p !== CURRENT_USER_NAME)
        .join(Strings.Common.listSeparator)
    : thread.from;

  const variant = useMemo(
    () => ({
      card: StyleSheet.flatten([styles.card, closed && styles.cardClosed]),
      topic: StyleSheet.flatten([
        styles.topic,
        unread && styles.topicUnread,
        closed && styles.topicClosed,
      ]),
      from: StyleSheet.flatten([styles.from, closed && styles.fromClosed]),
      preview: StyleSheet.flatten([
        styles.preview,
        unread && !closed && styles.previewUnread,
      ]),
    }),
    [styles, closed, unread],
  );

  return (
    <Card
      accessibilityLabel={`${thread.topic}${Strings.Common.listSeparator}${fromText}`}
      style={variant.card}
      onPress={onPress}
    >
      <View style={styles.row}>
        {isGroup ? (
          <GroupAvatar
            iconSize={GROUP_ICON_SIZE}
            muted={closed}
            size={AVATAR_SIZE}
          />
        ) : (
          <Avatar
            color={closed ? colors.textSecondary : undefined}
            initials={getInitials(thread.from)}
            size={AVATAR_SIZE}
          />
        )}
        <View style={styles.body}>
          <View style={styles.topRow}>
            <AppText numberOfLines={1} style={variant.topic}>
              {thread.topic}
            </AppText>
            <AppText style={styles.time}>{thread.time}</AppText>
          </View>
          <View style={styles.metaRow}>
            <AppText numberOfLines={1} style={variant.from}>
              {fromText}
            </AppText>
            {isGroup ? (
              <View style={styles.count}>
                <TeamIcon color={colors.textSecondary} size={COUNT_ICON_SIZE} />
                <AppText style={styles.countText}>{participants.length}</AppText>
              </View>
            ) : null}
          </View>
          <AppText numberOfLines={1} style={variant.preview}>
            {thread.preview}
          </AppText>
        </View>
        {closed ? (
          <View style={styles.closedBadge}>
            <AppText style={styles.closedBadgeText}>
              {Strings.MessagesScreen.closed}
            </AppText>
          </View>
        ) : null}
        {!closed && unread ? <View style={styles.unreadDot} /> : null}
      </View>
    </Card>
  );
};

export default ThreadCard;
