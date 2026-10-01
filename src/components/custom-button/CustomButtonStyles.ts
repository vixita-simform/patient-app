import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    base: {
      flexDirection: "row",
      paddingVertical: scale(16),
      paddingHorizontal: scale(24),
      alignItems: "center",
      justifyContent: "center",
      gap: scale(8),
      borderRadius: scale(16),
    },
    fill: {
      borderWidth: 0,
      backgroundColor: Colors[theme].green,
    },
    line: {
      borderWidth: scale(1),
      borderColor: Colors[theme].green,
      backgroundColor: Colors[theme].transparent,
    },
    pressed: {
      opacity: 0.7,
    },
    disabled: {
      opacity: 0.5,
    },
    textBase: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f16,
      fontWeight: Fonts.weight.extraSemi,
    },
    fillText: {
      color: Colors[theme].white,
    },
    lineText: {
      color: Colors[theme].green,
    },
  });

export default styles;
