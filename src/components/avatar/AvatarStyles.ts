import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    avatar: {
      width: scale(48),
      height: scale(48),
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      borderRadius: scale(24),
    },
    avatarText: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f16,
      color: Colors[theme].white,
    },
    avatarNavy: {
      backgroundColor: Colors[theme].navy,
    },
    avatarGreen: {
      backgroundColor: Colors[theme].green,
    },
    avatarBlue: {
      backgroundColor: Colors[theme].blue,
    },
    avatarAmber: {
      backgroundColor: Colors[theme].amber,
    },
    avatarSize44: {
      width: scale(44),
      height: scale(44),
    },
  });

export default styles;
