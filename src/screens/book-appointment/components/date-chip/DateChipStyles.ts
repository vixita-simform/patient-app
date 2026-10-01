import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

/**
 * Styles for the date-strip day cell.
 * @param {ThemeMode} theme - active theme mode.
 * @returns style sheet for `DateChip`.
 */
const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    date: {
      width: scale(58),
      height: scale(74),
      backgroundColor: Colors[theme].card,
      borderWidth: scale(1),
      borderColor: Colors[theme].line,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(4),
      flexShrink: 0,
      borderRadius: scale(16),
    },
    dateActive: {
      backgroundColor: Colors[theme].green,
      borderColor: Colors[theme].green,
    },
    dateOff: {
      opacity: 0.4,
    },
    dateDay: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.f12,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].muted,
    },
    dateActiveDay: {
      color: Colors[theme].paleMint,
    },
    dateNum: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h1,
      color: Colors[theme].navy,
    },
    dateActiveNum: {
      color: Colors[theme].white,
    },
  });

export default styles;
