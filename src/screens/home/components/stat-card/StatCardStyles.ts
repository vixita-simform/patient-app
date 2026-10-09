import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    pressable: {
      flex: 1,
    },
    card: {
      borderRadius: scale(12),
      padding: scale(14),
      borderWidth: 0,
    },
    label: {
      fontFamily: Fonts.family.semiBold,
      color: Colors[theme].whiteAlpha75,
      fontSize: Fonts.size.small,
      fontWeight: Fonts.weight.semi,
      marginTop: 0,
      marginHorizontal: 0,
      marginBottom: scale(3),
      textTransform: "uppercase",
      letterSpacing: Fonts.letterSpacing.wider,
    },
    value: {
      fontFamily: Fonts.family.extraBold,
      color: Colors[theme].white,
      fontSize: Fonts.size.f24,
      fontWeight: Fonts.weight.extraBold,
      marginTop: 0,
      marginHorizontal: 0,
      marginBottom: scale(1),
    },
    caption: {
      color: Colors[theme].whiteAlpha65,
      fontSize: Fonts.size.small,
    },
  });

export default styles;
