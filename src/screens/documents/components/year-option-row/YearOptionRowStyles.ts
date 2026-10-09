import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: scale(13),
      paddingHorizontal: scale(14),
      marginBottom: scale(6),
      borderRadius: scale(10),
      borderWidth: scale(1.5),
      borderColor: Colors[theme].border,
      backgroundColor: Colors[theme].background,
    },
    rowActive: {
      borderColor: Colors[theme].primary,
      backgroundColor: Colors[theme].primarySoft,
    },
    label: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.f14,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].text,
    },
    labelActive: {
      color: Colors[theme].primary,
    },
  });

export default styles;
