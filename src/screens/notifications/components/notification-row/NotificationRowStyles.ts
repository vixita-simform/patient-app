import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    // design-drift[flexDirection]: .notif compiles with no flexDirection (web row default); RN defaults to column, so it is set explicitly here.
    row: {
      flexDirection: "row",
      gap: scale(12),
      paddingVertical: scale(14),
      alignItems: "center",
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
    iconBoxCoral: {
      backgroundColor: Colors[theme].coralSoft,
    },
    iconBoxAmber: {
      backgroundColor: Colors[theme].amberSoft,
    },
    text: {
      flexDirection: "column",
      flex: 1,
      minWidth: 0,
      gap: scale(4),
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    title: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h3,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy,
    },
    unreadDot: {
      width: scale(8),
      height: scale(8),
      backgroundColor: Colors[theme].coral,
      marginLeft: scale(8),
      borderRadius: scale(4),
    },
    subtitle: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.h4,
      color: Colors[theme].muted,
    },
    time: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.h5,
      color: Colors[theme].muted,
    },
  });

export default styles;
