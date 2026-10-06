import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    body: {
      flex: 1,
    },
    bodyContent: {
      paddingTop: scale(4),
      paddingRight: scale(20),
      paddingBottom: scale(24),
      paddingLeft: scale(20),
      gap: scale(18),
    },
    groupLabel: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h4,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].muted,
    },
    group: {
      flexDirection: "column",
      gap: scale(10),
    },
  });

export default styles;
