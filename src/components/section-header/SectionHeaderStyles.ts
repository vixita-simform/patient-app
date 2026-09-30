import { StyleSheet } from "react-native";

import { Colors, Fonts, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    sectionTitle: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
    sectionTitleText: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f16,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy,
    },
    sectionTitleLink: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.h4,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].green,
    },
  });

export default styles;
