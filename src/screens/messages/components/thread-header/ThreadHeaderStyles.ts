import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8),
      paddingTop: scale(12),
      paddingBottom: scale(10),
      borderBottomWidth: scale(1),
      borderBottomColor: Colors[theme].border,
    },
    titleBlock: { flex: 1, minWidth: 0 },
    topic: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.h4,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].text,
    },
    metaRow: { flexDirection: "row", alignItems: "center", gap: scale(4) },
    participants: {
      fontSize: Fonts.size.small,
      color: Colors[theme].textSecondary,
    },
    closedBadge: {
      backgroundColor: Colors[theme].background,
      borderWidth: scale(1),
      borderColor: Colors[theme].border,
      paddingVertical: scale(3),
      paddingHorizontal: scale(8),
      borderRadius: scale(20),
    },
    closedBadgeText: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h6,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].textSecondary,
    },
  });

export default styles;
