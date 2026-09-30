import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    badgeGreen: {
      paddingVertical: scale(4),
      paddingHorizontal: scale(10),
      borderRadius: scale(10),
      backgroundColor: Colors[theme].greenSoft,
    },
    badgeGreenText: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f12,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].green,
    },
  });

export default styles;
