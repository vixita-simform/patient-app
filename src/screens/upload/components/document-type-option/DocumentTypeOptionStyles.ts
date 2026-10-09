import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    option: {
      padding: scale(12),
      marginBottom: scale(6),
    },
    optionSelected: {
      padding: scale(12),
      marginBottom: scale(6),
      borderColor: Colors[theme].primary,
    },
    optionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    optionText: {
      fontSize: Fonts.size.h4,
      color: Colors[theme].text,
    },
  });

export default styles;
