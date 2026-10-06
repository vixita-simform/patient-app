import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    quickTile: {
      // Two tiles per row: grow to fill, wrap once the row can't fit a third
      flexGrow: 1,
      flexBasis: "45%",
      backgroundColor: Colors[theme].card,
      borderWidth: scale(1),
      borderColor: Colors[theme].line,
      flexDirection: "column",
      gap: scale(10),
      padding: scale(14),
      borderRadius: scale(18),
    },
    quickTileEmergency: {
      backgroundColor: Colors[theme].coral,
      borderColor: Colors[theme].coral,
    },
    iconBox: {
      width: scale(44),
      height: scale(44),
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      borderRadius: scale(14),
    },
    iconBoxGreen: {
      backgroundColor: Colors[theme].greenSoft,
    },
    iconBoxBlue: {
      backgroundColor: Colors[theme].blueSoft,
    },
    iconBoxAmber: {
      backgroundColor: Colors[theme].amberSoft,
    },
    iconBoxEmergency: {
      backgroundColor: Colors[theme].whiteAlpha18,
    },
    textTitle: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h3,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy,
    },
    textTitleEmergency: {
      color: Colors[theme].white,
    },
  });

export default styles;
