import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8),
      paddingTop: scale(12),
      paddingHorizontal: 0,
      paddingBottom: scale(10),
    },
    backButton: {
      padding: 0,
    },
    title: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h2,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].text,
      letterSpacing: Fonts.letterSpacing.tight,
    },
    subtitle: {
      fontSize: Fonts.size.h5,
      color: Colors[theme].textSecondary,
    },
  });

export default styles;
