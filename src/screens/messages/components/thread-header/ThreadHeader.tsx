import type { ReactElement } from "react";
import { Pressable, View } from "react-native";

import { BackIcon, TeamIcon } from "../../../../assets/icons";
import { AppText, Avatar } from "../../../../components";
import { Strings } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import { scale, themes } from "../../../../theme";
import { getInitials, isGroupThread } from "../../../../utils";
import GroupAvatar from "../group-avatar/GroupAvatar";
import ThreadHeaderStyles from "./ThreadHeaderStyles";
import type { ThreadHeaderProps } from "./ThreadHeaderTypes";

const AVATAR_SIZE = 30;
const GROUP_ICON_SIZE = 15;
const BACK_ICON_SIZE = scale(18);
const META_ICON_SIZE = scale(11);

/**
 * Thread detail header: back button, avatar, topic, participant count and closed badge.
 * @param {ThreadHeaderProps} props - thread and back handler.
 * @returns {ReactElement} A React Element.
 */
const ThreadHeader = ({ thread, onBack }: ThreadHeaderProps): ReactElement => {
  const { styles, theme } = useTheme(ThreadHeaderStyles);
  const { colors } = themes[theme];
  const isGroup = isGroupThread(thread);

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel={Strings.Common.back}
        accessibilityRole="button"
        onPress={onBack}
      >
        <BackIcon color={colors.text} size={BACK_ICON_SIZE} />
      </Pressable>
      {isGroup ? (
        <GroupAvatar iconSize={GROUP_ICON_SIZE} size={AVATAR_SIZE} />
      ) : (
        <Avatar initials={getInitials(thread.from)} size={AVATAR_SIZE} />
      )}
      <View style={styles.titleBlock}>
        <AppText numberOfLines={1} style={styles.topic}>
          {thread.topic}
        </AppText>
        <View style={styles.metaRow}>
          <TeamIcon
            color={colors.textSecondary}
            size={META_ICON_SIZE}
          />
          <AppText style={styles.participants}>
            {`${thread.participants.length} ${Strings.MessagesScreen.participants}`}
          </AppText>
        </View>
      </View>
      {thread.closed ? (
        <View style={styles.closedBadge}>
          <AppText style={styles.closedBadgeText}>
            {Strings.MessagesScreen.closed}
          </AppText>
        </View>
      ) : null}
    </View>
  );
};

export default ThreadHeader;
