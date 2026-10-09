import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: scale(8),
      paddingVertical: scale(13),
      paddingHorizontal: scale(14),
      marginBottom: scale(6),
      borderRadius: scale(10),
      backgroundColor: Colors[theme].background,
      borderWidth: scale(1.5),
      borderColor: Colors[theme].border,
    },
    rowActive: {
      backgroundColor: Colors[theme].primarySoft,
      borderColor: Colors[theme].primary,
    },
    code: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f14,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].text,
    },
    name: {
      fontSize: Fonts.size.h5,
      color: Colors[theme].textSecondary,
    },
  });

export default styles;
