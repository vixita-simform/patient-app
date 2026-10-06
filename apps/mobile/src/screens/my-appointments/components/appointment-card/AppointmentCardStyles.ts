import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    card: {
      backgroundColor: Colors[theme].card,
      borderWidth: scale(1),
      borderColor: Colors[theme].line,
      padding: scale(16),
      borderRadius: scale(18),
      flexDirection: "column",
      gap: scale(12),
    },
    summary: {
      flexDirection: "column",
      gap: scale(12),
    },
    apptTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(12),
    },
    apptInfo: {
      flexDirection: "column",
      flex: 1,
      minWidth: 0,
    },
    apptTitle: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h3,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy,
    },
    apptSub: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.h4,
      color: Colors[theme].muted,
    },
    apptMeta: {
      flexDirection: "row",
      gap: scale(16),
      backgroundColor: Colors[theme].background,
      paddingVertical: scale(10),
      paddingHorizontal: scale(12),
      borderRadius: scale(12),
    },
    apptMetaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
    },
    apptMetaText: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.h4,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].navy,
    },
    apptActions: {
      flexDirection: "row",
      gap: scale(10),
    },
    apptActionBtn: {
      flex: 1,
      height: scale(40),
      paddingVertical: 0,
      paddingHorizontal: scale(12),
      borderRadius: scale(12),
    },
    apptActionBtnText: {
      fontSize: Fonts.size.f14,
    },
  });

export default styles;
