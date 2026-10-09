import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      paddingTop: 0,
      paddingHorizontal: scale(14),
      paddingBottom: scale(16),
    },
    header: {
      paddingTop: scale(12),
      paddingHorizontal: 0,
      paddingBottom: scale(10),
    },
    title: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.header,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].text,
      letterSpacing: Fonts.letterSpacing.tight,
      marginBottom: scale(3),
    },
    subtitle: {
      fontSize: Fonts.size.f12,
      color: Colors[theme].textSecondary,
    },
  });

export default styles;
