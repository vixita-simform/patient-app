import type { ReactElement } from "react";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { DownloadIcon, InvoiceIcon } from "../../../../assets/icons";
import { AppText } from "../../../../components";
import { Strings } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import { scale, themes } from "../../../../theme";
import ChatBubbleStyles from "./ChatBubbleStyles";
import type { ChatBubbleProps } from "./ChatBubbleTypes";

const FILE_ICON_SIZE = scale(15);
const DOWNLOAD_ICON_SIZE = scale(14);

/**
 * Chat message bubble in text or attachment form, with optional "Visible to" chips.
 * Renders nothing when the message has neither text nor an attachment.
 * @param {ChatBubbleProps} props - message, sender label flag and recipient lookup list.
 * @returns {ReactElement | null} A React Element, or null for an empty message.
 */
const ChatBubble = ({
  message,
  showSender,
  recipients,
}: ChatBubbleProps): ReactElement | null => {
  const { styles, theme } = useTheme(ChatBubbleStyles);
  const { colors } = themes[theme];
  const mine = !message.staff;
  const { attachment, text } = message;

  const variant = useMemo(
    () => ({
      wrapper: StyleSheet.flatten([styles.wrapper, mine && styles.wrapperMine]),
      attachmentBubble: StyleSheet.flatten([
        styles.bubble,
        styles.bubbleAttachment,
        mine && styles.bubbleMine,
        mine && styles.bubbleAttachmentMine,
      ]),
      bubble: StyleSheet.flatten([styles.bubble, mine && styles.bubbleMine]),
      text: StyleSheet.flatten([styles.text, mine && styles.textMine]),
      time: StyleSheet.flatten([styles.time, mine && styles.timeMine]),
    }),
    [styles, mine],
  );

  // Ids not in the recipient lookup are dropped rather than shown raw.
  const recipientLabels = useMemo(
    () =>
      (message.recipients ?? []).flatMap((id) => {
        const match = recipients.find((r) => r.id === id);
        return match ? [{ id, label: match.label }] : [];
      }),
    [message.recipients, recipients],
  );

  if (!attachment && !text) return null;

  return (
    <View style={variant.wrapper}>
      {showSender ? (
        <AppText style={styles.sender}>{message.sender}</AppText>
      ) : null}
      {attachment ? (
        <View style={variant.attachmentBubble}>
          <View style={styles.attachmentRow}>
            <View style={styles.fileIconBox}>
              <InvoiceIcon color={colors.primary} size={FILE_ICON_SIZE} />
            </View>
            <View style={styles.fileInfo}>
              <AppText numberOfLines={1} style={styles.fileName}>
                {attachment.name}
              </AppText>
              <AppText style={styles.fileSize}>{attachment.size}</AppText>
            </View>
            <DownloadIcon color={colors.primary} size={DOWNLOAD_ICON_SIZE} />
          </View>
          {recipientLabels.length > 0 ? (
            <View style={styles.chips}>
              <AppText style={styles.chipsLabel}>
                {Strings.MessagesScreen.visibleTo}
              </AppText>
              {recipientLabels.map((r) => (
                <View key={r.id} style={styles.chip}>
                  <AppText style={styles.chipText}>{r.label}</AppText>
                </View>
              ))}
            </View>
          ) : null}
          <AppText style={styles.attachmentTime}>{message.time}</AppText>
        </View>
      ) : (
        <View style={variant.bubble}>
          <AppText style={variant.text}>{text}</AppText>
          <AppText style={variant.time}>{message.time}</AppText>
        </View>
      )}
    </View>
  );
};

export default ChatBubble;
