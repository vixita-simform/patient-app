import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) => {
  const card = {
    backgroundColor: Colors[theme].card,
    borderWidth: scale(1),
    borderColor: Colors[theme].line,
    padding: scale(16),
    borderRadius: scale(18),
  } as const;
  const iconBtn = {
    width: scale(40),
    height: scale(40),
    backgroundColor: Colors[theme].card,
    borderWidth: scale(1),
    borderColor: Colors[theme].line,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: scale(12),
  } as const;

  return StyleSheet.create({
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
      fontSize: Fonts.size.header,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy,
    },
    iconBtn,
    /** Invisible spacer that keeps the header title centred. */
    iconBtnGhost: {
      ...iconBtn,
      backgroundColor: Colors[theme].transparent,
      borderColor: Colors[theme].transparent,
    },
    bodyWrapper: {
      flex: 1,
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
    doctorCard: {
      ...card,
      flexDirection: "row",
      alignItems: "center",
      gap: scale(12),
    },
    col: {
      flexDirection: "column",
    },
    doctorInfo: {
      flexDirection: "column",
      flex: 1,
      minWidth: 0,
    },
    tTitle: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h3,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy,
    },
    tSub: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.f14,
      color: Colors[theme].muted,
    },
    sectionTitle: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: scale(10),
    },
    sectionTitleH3: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f16,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy,
    },
    sectionTitleLink: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.f14,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].green,
    },
    hScroll: {
      flexGrow: 0,
    },
    hScrollContent: {
      flexDirection: "row",
      gap: scale(8),
    },
    h3Inline: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f16,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy,
      marginBottom: scale(10),
    },
    slots: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(10),
    },
    visitTypeRow: {
      flexDirection: "row",
      gap: scale(12),
      marginTop: scale(10),
    },
    reasonSection: {
      flexDirection: "column",
      gap: scale(8),
    },
    reasonInput: {
      ...card,
      minHeight: scale(80),
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.f14,
      color: Colors[theme].navy,
      textAlignVertical: "top",
    },
    footerBar: {
      flexDirection: "column",
      gap: scale(8),
      paddingTop: scale(14),
      paddingRight: scale(20),
      paddingBottom: scale(14),
      paddingLeft: scale(20),
      backgroundColor: Colors[theme].card,
      borderTopWidth: scale(1),
      borderTopColor: Colors[theme].line,
      flexShrink: 0,
    },
    footerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    footerSummary: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
    },
    footerFee: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f16,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy,
    },
    btnPrimary: {
      width: "100%",
    },
    stateText: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.f14,
      color: Colors[theme].muted,
      textAlign: "center",
      padding: scale(24),
    },
  });
};

export default styles;
