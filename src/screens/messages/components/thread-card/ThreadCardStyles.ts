import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    card: { padding: scale(12), marginBottom: scale(7) },
    cardClosed: { backgroundColor: Colors[theme].background, opacity: 0.7 },
    row: { flexDirection: "row", gap: scale(10), alignItems: "flex-start" },
    body: { flex: 1, minWidth: 0 },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: scale(1),
      gap: scale(8),
    },
    topic: {
      flexShrink: 1,
      fontFamily: Fonts.family.medium,
      fontSize: Fonts.size.h4,
      fontWeight: Fonts.weight.low,
      color: Colors[theme].text,
    },
    topicUnread: {
      fontFamily: Fonts.family.bold,
      fontWeight: Fonts.weight.extraSemi,
    },
    topicClosed: { color: Colors[theme].textSecondary },
    time: {
      fontSize: Fonts.size.small,
      color: Colors[theme].textSecondary,
      flexShrink: 0,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(5),
      marginBottom: scale(1),
    },
    from: {
      flexShrink: 1,
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.small,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].accent,
    },
    fromClosed: { color: Colors[theme].textSecondary },
    count: { flexDirection: "row", alignItems: "center", gap: scale(2) },
    countText: { fontSize: Fonts.size.h6, color: Colors[theme].textSecondary },
    preview: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.f12,
      color: Colors[theme].textSecondary,
      fontWeight: Fonts.weight.semiLow,
    },
    previewUnread: {
      fontFamily: Fonts.family.semiBold,
      color: Colors[theme].text,
      fontWeight: Fonts.weight.semi,
    },
    closedBadge: {
      backgroundColor: Colors[theme].card,
      borderWidth: scale(1),
      borderColor: Colors[theme].border,
      paddingVertical: scale(2),
      paddingHorizontal: scale(7),
      borderRadius: scale(20),
      flexShrink: 0,
      alignSelf: "center",
    },
    closedBadgeText: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h6,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].textSecondary,
    },
    unreadDot: {
      width: scale(7),
      height: scale(7),
      borderRadius: scale(3.5),
      backgroundColor: Colors[theme].accent,
      marginTop: scale(7),
      flexShrink: 0,
    },
  });

export default styles;
