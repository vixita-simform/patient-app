import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: scale(14),
      paddingBottom: scale(16),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8),
      paddingTop: scale(12),
      paddingBottom: scale(10),
    },
    title: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h2,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].text,
    },
    subtitle: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.h5,
      color: Colors[theme].textSecondary,
    },
  });

export default styles;
