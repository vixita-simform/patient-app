import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    summary: {
      flexDirection: "row",
      backgroundColor: Colors[theme].green,
      gap: scale(10),
      padding: scale(16),
      borderRadius: scale(20),
    },
    tile: {
      flex: 1,
      backgroundColor: Colors[theme].whiteAlpha12,
      flexDirection: "column",
      gap: scale(2),
      padding: scale(12),
      borderRadius: scale(14),
    },
    tileValue: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f22,
      fontWeight: Fonts.weight.extraBold,
      color: Colors[theme].white,
    },
    tileLabel: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.f12,
      color: Colors[theme].paleMint,
    },
  });

export default styles;
