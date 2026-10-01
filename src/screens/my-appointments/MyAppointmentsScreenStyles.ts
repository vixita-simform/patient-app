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
      flexShrink: 0,
    },
    headerTitle: {
      fontFamily: Fonts.family.bold,
      fontWeight: Fonts.weight.extraSemi,
      fontSize: Fonts.size.f22,
      color: Colors[theme].navy,
    },
    // Design's icon-btn is inline-overridden to a filled green square with a white icon
    // (shared IconButton has no style passthrough and defaults to a bordered card
    // background), so this one 40px square is built locally to match its footprint.
    headerAddBtn: {
      width: scale(40),
      height: scale(40),
      backgroundColor: Colors[theme].green,
      borderWidth: scale(1),
      borderColor: Colors[theme].green,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: scale(12),
    },
    headerAddBtnPressed: {
      opacity: 0.7,
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
    listHeader: {
      paddingBottom: scale(18),
    },
    stateText: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.h4,
      color: Colors[theme].muted,
      textAlign: "center",
      paddingTop: scale(24),
    },
  });

export default styles;
