import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    screen: {
      flex: 1,
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
    },
    headerTitle: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f22,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy,
    },
    markAllRead: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h4,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].green,
    },
    markAllReadDisabled: {
      color: Colors[theme].muted,
    },
    body: {
      flex: 1,
    },
    bodyContent: {
      paddingTop: scale(4),
      paddingRight: scale(20),
      paddingBottom: scale(24),
      paddingLeft: scale(20),
      gap: scale(18),
    },
    group: {
      flexDirection: "column",
      gap: scale(10),
    },
    groupLabel: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h4,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].muted,
    },
    card: {
      backgroundColor: Colors[theme].card,
      borderWidth: scale(1),
      borderColor: Colors[theme].line,
      paddingHorizontal: scale(16),
      paddingVertical: scale(2),
      borderRadius: scale(18),
    },
    divider: {
      borderTopWidth: scale(1),
      borderTopColor: Colors[theme].line,
    },
  });

export default styles;
