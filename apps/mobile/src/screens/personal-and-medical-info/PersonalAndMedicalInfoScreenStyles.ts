import { StyleSheet } from "react-native";

import { Colors, scale, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    phone: {
      flex: 1,
      backgroundColor: Colors[theme].background,
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
