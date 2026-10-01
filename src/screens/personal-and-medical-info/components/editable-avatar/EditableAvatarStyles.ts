import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    avatarEdit: {
      position: "relative",
      alignSelf: "center",
    },
    avatar: {
      width: scale(88),
      height: scale(88),
      backgroundColor: Colors[theme].navy,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      borderRadius: scale(44),
    },
    avatarText: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f28,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].white,
    },
    avatarPen: {
      position: "absolute",
      right: scale(-2),
      bottom: scale(-2),
      width: scale(32),
      height: scale(32),
      backgroundColor: Colors[theme].navy,
      borderWidth: scale(3),
      borderColor: Colors[theme].background,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: scale(16),
    },
  });

export default styles;
