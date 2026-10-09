import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    tile: {
      flex: 1,
      paddingVertical: scale(16),
      paddingHorizontal: scale(8),
      alignItems: "center",
      borderWidth: scale(2),
      borderStyle: "dashed",
      borderColor: Colors[theme].border,
      backgroundColor: Colors[theme].background,
    },
    iconBox: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(11),
      alignItems: "center",
      justifyContent: "center",
      marginBottom: scale(8),
    },
    iconBoxGreen: {
      backgroundColor: Colors[theme].successSoft,
    },
    iconBoxTeal: {
      backgroundColor: Colors[theme].primaryTint,
    },
    label: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.f12,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].text,
      textAlign: "center",
    },
  });

export default styles;
