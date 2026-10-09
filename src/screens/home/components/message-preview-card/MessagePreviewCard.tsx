import type { ReactElement } from "react";
import { View } from "react-native";

import { AppText, Avatar, Card } from "../../../../components";
import { Strings } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import { getInitials } from "../../../../utils";
import MessagePreviewCardStyles from "./MessagePreviewCardStyles";
import type { MessagePreviewCardProps } from "./MessagePreviewCardTypes";

const AVATAR_SIZE = 34;

/**
 * Card previewing the latest message of a thread.
 * @param {MessagePreviewCardProps} props - thread and press handler.
 * @returns {ReactElement} A React Element.
 */
const MessagePreviewCard = ({
  message,
  onPress,
}: MessagePreviewCardProps): ReactElement => {
  const { styles } = useTheme(MessagePreviewCardStyles);

  return (
    <Card
      accessibilityLabel={`${message.from}${Strings.Common.listSeparator}${message.topic}`}
      style={styles.card}
      onPress={onPress}>
      <View style={styles.row}>
        <Avatar initials={getInitials(message.from)} size={AVATAR_SIZE} />
        <View style={styles.body}>
          <View style={styles.topRow}>
            <AppText style={[styles.from, message.unread && styles.fromUnread]}>
              {message.from}
            </AppText>
            <AppText style={styles.time}>{message.time}</AppText>
          </View>
          <AppText style={styles.topic}>{message.topic}</AppText>
          <AppText numberOfLines={1} style={styles.preview}>
            {message.preview}
          </AppText>
        </View>
        {message.unread ? <View style={styles.unreadDot} /> : null}
      </View>
    </Card>
  );
};

export default MessagePreviewCard;
