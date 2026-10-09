import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    wrapper: {
      flexDirection: "column",
      alignItems: "flex-start",
      marginBottom: scale(8),
    },
    wrapperMine: { alignItems: "flex-end" },
    sender: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.h6,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].accent,
      marginBottom: scale(2),
      marginLeft: scale(4),
    },
    bubble: {
      backgroundColor: Colors[theme].successSoft,
      borderTopLeftRadius: scale(12),
      borderTopRightRadius: scale(12),
      borderBottomRightRadius: scale(12),
      borderBottomLeftRadius: scale(3),
      paddingVertical: scale(9),
      paddingHorizontal: scale(12),
      maxWidth: "85%",
    },
    bubbleMine: {
      backgroundColor: Colors[theme].primary,
      borderBottomRightRadius: scale(3),
      borderBottomLeftRadius: scale(12),
    },
    bubbleAttachment: { paddingHorizontal: scale(11) },
    bubbleAttachmentMine: { backgroundColor: Colors[theme].primaryTint },
    text: {
      fontSize: Fonts.size.f12,
      color: Colors[theme].text,
      lineHeight: scale(18),
    },
    textMine: { color: Colors[theme].white },
    time: {
      fontSize: Fonts.size.h6,
      color: Colors[theme].textSecondary,
      marginTop: scale(3),
      textAlign: "right",
    },
    timeMine: { color: Colors[theme].whiteAlpha70 },
    attachmentRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8),
    },
    fileIconBox: {
      width: scale(30),
      height: scale(30),
      borderRadius: scale(7),
      backgroundColor: Colors[theme].card,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    fileInfo: { minWidth: 0, flexShrink: 1 },
    fileName: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.h5,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].text,
    },
    fileSize: { fontSize: Fonts.size.h6, color: Colors[theme].textSecondary },
    chips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(4),
      marginTop: scale(6),
    },
    chipsLabel: {
      fontSize: Fonts.size.h6,
      color: Colors[theme].textSecondary,
      alignSelf: "center",
    },
    chip: {
      backgroundColor: Colors[theme].successSoft,
      borderWidth: scale(1),
      borderColor: Colors[theme].successBorder,
      borderRadius: scale(20),
      paddingVertical: scale(2),
      paddingHorizontal: scale(7),
    },
    chipText: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.h6,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].primary,
    },
    attachmentTime: {
      fontSize: Fonts.size.h6,
      color: Colors[theme].textSecondary,
      marginTop: scale(4),
      textAlign: "right",
    },
  });

export default styles;
