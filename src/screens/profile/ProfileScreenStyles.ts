import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
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
    body: {
      flex: 1,
    },
    bodyContent: {
      flexDirection: "column",
      paddingTop: scale(4),
      paddingRight: scale(20),
      paddingBottom: scale(24),
      paddingLeft: scale(20),
      gap: scale(18),
    },
    // .card + .group-card: 16px card padding with the vertical padding tightened to 4px.
    groupCard: {
      backgroundColor: Colors[theme].card,
      borderWidth: scale(1),
      borderColor: Colors[theme].line,
      paddingHorizontal: scale(16),
      paddingVertical: scale(4),
      borderRadius: scale(18),
    },
    logoutBtn: {
      height: scale(52),
      width: "100%",
      paddingVertical: 0,
      backgroundColor: Colors[theme].coralSoft,
    },
    logoutText: {
      color: Colors[theme].coral,
    },
  });

export default styles;
