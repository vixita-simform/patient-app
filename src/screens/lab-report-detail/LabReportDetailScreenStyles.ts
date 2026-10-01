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

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: Colors[theme].background,
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
      fontSize: Fonts.size.header,
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
    metaCard: {
      ...card,
      flexDirection: "column",
      gap: scale(12),
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    tSub: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.h4,
      color: Colors[theme].muted,
    },
    metaValue: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f14,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy,
    },
    alertCard: {
      ...card,
      flexDirection: "row",
      alignItems: "center",
      gap: scale(12),
      backgroundColor: Colors[theme].coralSoft,
      // design-drift[borderColor]: literal '#F5C8B8' has no matching token; added Colors.alertBorder
      borderColor: Colors[theme].alertBorder,
    },
    alertIcon: {
      flexShrink: 0,
    },
    alertText: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f14,
      fontWeight: Fonts.weight.semi,
      // design-drift[color]: literal '#8E2E13' has no matching token; added Colors.alertInk
      color: Colors[theme].alertInk,
      flex: 1,
    },
    resultsCard: {
      ...card,
      flexDirection: "column",
      paddingTop: scale(4),
      paddingBottom: scale(4),
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
    btnPrimary: {
      height: scale(52),
      borderWidth: 0,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: scale(8),
      width: "100%",
      borderRadius: scale(16),
      backgroundColor: Colors[theme].green,
    },
    btnPrimaryText: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f16,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].white,
    },
  });
};

export default styles;
