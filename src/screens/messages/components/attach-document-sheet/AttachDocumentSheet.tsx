import type { ReactElement } from "react";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { CameraIcon, FolderIcon, InvoiceIcon } from "../../../../assets/icons";
import { AppText, RecipientPicker, Sheet } from "../../../../components";
import { Strings } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import { scale, themes } from "../../../../theme";
import AttachDocumentSheetStyles from "./AttachDocumentSheetStyles";
import type { AttachDocumentSheetProps } from "./AttachDocumentSheetTypes";

const SOURCE_ICON_SIZE = scale(16);
const FILE_ICON_SIZE = scale(14);

/**
 * Two-step sheet for attaching a document: pick a source, then choose recipients.
 * @param {AttachDocumentSheetProps} props - step state, recipients and handlers.
 * @returns {ReactElement} A React Element.
 */
const AttachDocumentSheet = ({
  visible,
  step,
  attachment,
  recipients,
  selected,
  onChangeSelected,
  onPickSource,
  onBack,
  onSend,
  onClose,
}: AttachDocumentSheetProps): ReactElement => {
  const { styles, theme } = useTheme(AttachDocumentSheetStyles);
  const { colors } = themes[theme];
  const count = selected.length;
  const canSend = count > 0;
  const { Common: C, MessagesScreen: S } = Strings;
  const sendLabel = canSend
    ? `${S.sendTo} ${count} ${count > 1 ? S.recipientPlural : S.recipientSingular}`
    : S.selectRecipient;

  const sendStyles = useMemo(
    () => ({
      button: StyleSheet.flatten([
        styles.sendButton,
        !canSend && styles.sendButtonDisabled,
      ]),
      text: StyleSheet.flatten([
        styles.sendButtonText,
        !canSend && styles.sendButtonTextDisabled,
      ]),
    }),
    [styles, canSend],
  );

  return (
    <Sheet
      title={step === "source" ? S.attachDocument : C.whoShouldSee}
      visible={visible}
      onClose={onClose}
    >
      {step === "source" ? (
        <View>
          <AppText style={styles.hint}>{S.uploadNote}</AppText>
          <Pressable
            accessibilityLabel={C.takePhoto}
            accessibilityRole="button"
            style={styles.sourceOption}
            onPress={() => onPickSource("camera")}
          >
            <CameraIcon color={colors.primary} size={SOURCE_ICON_SIZE} />
            <AppText style={styles.sourceLabel}>{C.takePhoto}</AppText>
          </Pressable>
          <Pressable
            accessibilityLabel={C.uploadFromStorage}
            accessibilityRole="button"
            style={styles.sourceOption}
            onPress={() => onPickSource("storage")}
          >
            <FolderIcon color={colors.primary} size={SOURCE_ICON_SIZE} />
            <AppText style={styles.sourceLabel}>{C.uploadFromStorage}</AppText>
          </Pressable>
        </View>
      ) : (
        <View>
          <View style={styles.fileCard}>
            <View style={styles.fileIconBox}>
              <InvoiceIcon color={colors.primary} size={FILE_ICON_SIZE} />
            </View>
            <View style={styles.fileInfo}>
              <AppText numberOfLines={1} style={styles.fileName}>
                {attachment.name}
              </AppText>
              <AppText style={styles.fileSize}>{attachment.size}</AppText>
            </View>
          </View>
          <RecipientPicker
            recipients={recipients}
            value={selected}
            onChange={onChangeSelected}
          />
          <Pressable
            accessibilityLabel={sendLabel}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSend }}
            disabled={!canSend}
            style={sendStyles.button}
            onPress={onSend}
          >
            <AppText style={sendStyles.text}>{sendLabel}</AppText>
          </Pressable>
          <Pressable
            accessibilityLabel={C.back}
            accessibilityRole="button"
            style={styles.backButton}
            onPress={onBack}
          >
            <AppText style={styles.backButtonText}>{C.back}</AppText>
          </Pressable>
        </View>
      )}
    </Sheet>
  );
};

export default AttachDocumentSheet;
