import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    card: {
      padding: scale(12),
    },
    row: {
      flexDirection: "row",
      gap: scale(10),
      alignItems: "flex-start",
    },
    body: {
      flex: 1,
      minWidth: 0,
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: scale(1),
    },
    from: {
      fontFamily: Fonts.family.medium,
      fontSize: Fonts.size.f12,
      fontWeight: Fonts.weight.low,
      color: Colors[theme].text,
    },
    fromUnread: {
      fontFamily: Fonts.family.bold,
      fontWeight: Fonts.weight.extraSemi,
    },
    time: {
      fontSize: Fonts.size.small,
      color: Colors[theme].textSecondary,
    },
    topic: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.small,
      color: Colors[theme].accent,
      fontWeight: Fonts.weight.semi,
      marginTop: 0,
      marginHorizontal: 0,
      marginBottom: scale(1),
    },
    preview: {
      fontSize: Fonts.size.h5,
      color: Colors[theme].textSecondary,
    },
    unreadDot: {
      width: scale(7),
      height: scale(7),
      borderRadius: scale(3.5),
      backgroundColor: Colors[theme].accent,
      marginTop: scale(5),
      flexShrink: 0,
    },
  });

export default styles;
