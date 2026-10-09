import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    card: {
      padding: scale(12),
      marginBottom: scale(6),
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(10),
    },
    iconTile: {
      width: scale(34),
      height: scale(34),
      borderRadius: scale(9),
      backgroundColor: Colors[theme].background,
      alignItems: "center",
      justifyContent: "center",
    },
    textCol: {
      flex: 1,
      minWidth: 0,
    },
    label: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.h4,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].text,
      marginBottom: scale(1),
    },
    desc: {
      fontSize: Fonts.size.h5,
      color: Colors[theme].textSecondary,
    },
  });

export default styles;
