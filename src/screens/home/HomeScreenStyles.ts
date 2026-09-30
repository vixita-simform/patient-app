import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: scale(6),
      paddingRight: scale(20),
      paddingBottom: scale(10),
      paddingLeft: scale(20),
      flexShrink: 0,
    },
    rowGap12: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(12),
    },
    col: {
      flexDirection: "column",
    },
    textXs: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.f12,
      color: Colors[theme].muted,
    },
    greetingName: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h2,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy,
    },
    scroll: {
      flex: 1,
    },
    body: {
      paddingTop: scale(4),
      paddingRight: scale(20),
      paddingBottom: scale(24),
      paddingLeft: scale(20),
      flexDirection: "column",
      gap: scale(18),
    },
    quick: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(12),
    },
    vitals: {
      flexDirection: "row",
      gap: scale(10),
    },
  });

export default styles;
