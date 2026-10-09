import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    listContainer: { flex: 1 },
    listContent: {
      paddingHorizontal: scale(14),
      paddingBottom: scale(16),
    },
    header: {
      paddingTop: scale(12),
      paddingBottom: scale(10),
    },
    title: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.header,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].text,
      marginBottom: scale(3),
      letterSpacing: Fonts.letterSpacing.tight,
    },
    subtitle: {
      fontSize: Fonts.size.f12,
      color: Colors[theme].textSecondary,
    },
    thread: {
      flex: 1,
      paddingHorizontal: scale(14),
    },
    messageList: { flex: 1 },
    messageListContent: {
      paddingVertical: scale(10),
    },
    closedFooter: {
      paddingTop: scale(12),
      paddingBottom: scale(16),
    },
    closedNotice: {
      alignItems: "center",
      backgroundColor: Colors[theme].background,
      borderWidth: scale(1),
      borderColor: Colors[theme].border,
      borderRadius: scale(10),
      padding: scale(11),
    },
    closedNoticeTitle: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.h5,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].textSecondary,
      textAlign: "center",
    },
    closedNoticeBody: {
      fontSize: Fonts.size.small,
      color: Colors[theme].textSecondary,
      marginTop: scale(2),
      textAlign: "center",
    },
  });

export default styles;
