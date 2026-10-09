import type { ReactElement } from "react";
import { useMemo } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { PaperclipIcon, SendIcon } from "../../../../assets/icons";
import { Strings } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import { scale, themes } from "../../../../theme";
import ChatComposerStyles from "./ChatComposerStyles";
import type { ChatComposerProps } from "./ChatComposerTypes";

const ATTACH_ICON_SIZE = scale(15);
const SEND_ICON_SIZE = scale(14);

/**
 * Message composer: attach button, text input and send button.
 * @param {ChatComposerProps} props - input value, attach state and handlers.
 * @returns {ReactElement} A React Element.
 */
const ChatComposer = ({
  value,
  onChangeText,
  attachActive,
  onPressAttach,
  onPressSend,
}: ChatComposerProps): ReactElement => {
  const { styles, theme } = useTheme(ChatComposerStyles);
  const { colors } = themes[theme];
  const attachButtonStyle = useMemo(
    () =>
      StyleSheet.flatten([
        styles.attachButton,
        attachActive && styles.attachButtonActive,
      ]),
    [styles, attachActive],
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          accessibilityLabel={Strings.MessagesScreen.attachDocumentLabel}
          accessibilityRole="button"
          accessibilityState={{ expanded: attachActive }}
          style={attachButtonStyle}
          onPress={onPressAttach}
        >
          <PaperclipIcon color={colors.primary} size={ATTACH_ICON_SIZE} />
        </Pressable>
        <TextInput
          accessibilityLabel={Strings.MessagesScreen.typeMessage}
          placeholder={Strings.MessagesScreen.typeMessage}
          placeholderTextColor={colors.textSecondary}
          returnKeyType="send"
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onPressSend}
        />
        <Pressable
          accessibilityLabel={Strings.MessagesScreen.sendMessage}
          accessibilityRole="button"
          style={styles.sendButton}
          onPress={onPressSend}
        >
          <SendIcon color={colors.white} size={SEND_ICON_SIZE} />
        </Pressable>
      </View>
    </View>
  );
};

export default ChatComposer;
