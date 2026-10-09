import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    sectionTitle: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: scale(10),
    },
    sectionTitleText: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f14,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].text,
      letterSpacing: Fonts.letterSpacing.snug,
    },
    sectionTitleLink: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.f12,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].accent,
    },
  });

export default styles;
