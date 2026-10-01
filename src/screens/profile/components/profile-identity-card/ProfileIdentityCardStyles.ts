import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(16),
      backgroundColor: Colors[theme].card,
      borderWidth: scale(1),
      borderColor: Colors[theme].line,
      padding: scale(16),
      borderRadius: scale(18),
    },
    avatarLg: {
      width: scale(64),
      height: scale(64),
      borderRadius: scale(32),
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      backgroundColor: Colors[theme].navy,
    },
    avatarText: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f22,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].white,
    },
    col: {
      flex: 1,
      minWidth: 0,
      flexDirection: "column",
      gap: scale(4),
    },
    profileName: {
      fontFamily: Fonts.family.extraBold,
      fontSize: Fonts.size.header,
      fontWeight: Fonts.weight.extraBold,
      color: Colors[theme].navy,
    },
    tSub: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.h4,
      color: Colors[theme].muted,
    },
  });

export default styles;
