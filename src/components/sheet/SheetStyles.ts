import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "flex-end",
    },
    backdrop: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: Colors[theme].overlay,
    },
    panel: {
      position: "relative",
      backgroundColor: Colors[theme].card,
      borderTopLeftRadius: scale(18),
      borderTopRightRadius: scale(18),
      borderBottomRightRadius: 0,
      borderBottomLeftRadius: 0,
      paddingTop: scale(8),
      paddingHorizontal: scale(14),
      paddingBottom: scale(22),
      shadowColor: Colors[theme].black,
      shadowOpacity: 0.18,
      shadowRadius: scale(30),
      shadowOffset: { width: 0, height: -scale(8) },
      elevation: 8,
      maxHeight: "70%",
    },
    handle: {
      width: scale(38),
      height: scale(4),
      borderRadius: scale(2),
      backgroundColor: Colors[theme].border,
      marginTop: scale(6),
      marginBottom: scale(12),
      alignSelf: "center",
    },
    title: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h4,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].text,
      marginTop: 0,
      marginBottom: scale(12),
      textAlign: "center",
    },
  });

export default styles;
