import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    tile: {
      alignItems: "center",
      flexShrink: 0,
      width: scale(70),
    },
    name: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.h5,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].text,
      marginTop: scale(5),
      marginHorizontal: 0,
      marginBottom: 0,
      textAlign: "center",
    },
    role: {
      fontSize: Fonts.size.h6,
      color: Colors[theme].textSecondary,
      marginTop: scale(1),
      marginHorizontal: 0,
      marginBottom: 0,
      textAlign: "center",
    },
  });

export default styles;
