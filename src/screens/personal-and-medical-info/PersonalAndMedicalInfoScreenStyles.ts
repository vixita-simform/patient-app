import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    phone: {
      flex: 1,
      backgroundColor: Colors[theme].background,
    },
    // design-drift[flexDirection]: .header compiles with no flexDirection (web row default); RN defaults to column, so it is set explicitly here.
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: scale(6),
      paddingRight: scale(20),
      paddingBottom: scale(10),
      paddingLeft: scale(20),
      flexShrink: 0,
    },
    headerTitle: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.header,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy,
    },
    iconBtnGhost: {
      width: scale(40),
      height: scale(40),
      backgroundColor: Colors[theme].transparent,
      borderColor: Colors[theme].transparent,
    },
    body: {
      flex: 1,
    },
    bodyContent: {
      paddingTop: scale(4),
      paddingRight: scale(20),
      paddingBottom: scale(24),
      paddingLeft: scale(20),
      flexDirection: "column",
      gap: scale(18),
    },
    footerBar: {
      paddingTop: scale(14),
      paddingRight: scale(20),
      paddingBottom: scale(30),
      paddingLeft: scale(20),
      backgroundColor: Colors[theme].card,
      borderTopWidth: scale(1),
      borderTopColor: Colors[theme].line,
      flexShrink: 0,
    },
  });

export default styles;
