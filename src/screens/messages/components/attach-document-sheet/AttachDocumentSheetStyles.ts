import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    hint: {
      fontSize: Fonts.size.small,
      color: Colors[theme].textSecondary,
      textAlign: "center",
      marginBottom: scale(12),
    },
    sourceOption: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(11),
      paddingVertical: scale(13),
      paddingHorizontal: scale(14),
      marginBottom: scale(6),
      borderRadius: scale(10),
      backgroundColor: Colors[theme].background,
      borderWidth: scale(1.5),
      borderColor: Colors[theme].border,
    },
    sourceLabel: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.h4,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].text,
    },
    fileCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(9),
      paddingVertical: scale(9),
      paddingHorizontal: scale(11),
      borderRadius: scale(9),
      backgroundColor: Colors[theme].background,
      borderWidth: scale(1),
      borderColor: Colors[theme].border,
      marginBottom: scale(12),
    },
    fileIconBox: {
      width: scale(28),
      height: scale(28),
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
    sendButton: {
      width: "100%",
      marginTop: scale(14),
      padding: scale(12),
      borderRadius: scale(9),
      backgroundColor: Colors[theme].primary,
      alignItems: "center",
    },
    sendButtonDisabled: { backgroundColor: Colors[theme].border },
    sendButtonText: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h4,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].white,
    },
    sendButtonTextDisabled: { color: Colors[theme].textSecondary },
    backButton: {
      width: "100%",
      marginTop: scale(7),
      padding: scale(10),
      borderRadius: scale(9),
      borderWidth: scale(1),
      borderColor: Colors[theme].border,
      backgroundColor: Colors[theme].card,
      alignItems: "center",
    },
    backButtonText: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.f12,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].textSecondary,
    },
  });

export default styles;
