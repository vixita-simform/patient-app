import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    title: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h2,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy,
      paddingHorizontal: scale(20),
      paddingVertical: scale(10),
    },
  });

export default styles;
