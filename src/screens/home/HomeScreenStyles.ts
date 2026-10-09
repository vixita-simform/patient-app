import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      paddingTop: 0,
      paddingHorizontal: scale(14),
      paddingBottom: scale(16),
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: scale(12),
      paddingHorizontal: 0,
      paddingBottom: scale(16),
    },
    headerText: {
      flex: 1,
      minWidth: 0,
      paddingRight: scale(10),
    },
    greeting: {
      color: Colors[theme].textSecondary,
      fontSize: Fonts.size.f12,
      marginTop: 0,
      marginHorizontal: 0,
      marginBottom: scale(2),
    },
    clientName: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.header,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].text,
      letterSpacing: Fonts.letterSpacing.tight,
    },
    clientFarm: {
      color: Colors[theme].textSecondary,
      fontSize: Fonts.size.h5,
      marginTop: scale(2),
      marginHorizontal: 0,
      marginBottom: 0,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(12),
      flexShrink: 0,
    },
    switchButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[theme].card,
      borderWidth: scale(1),
      borderColor: Colors[theme].border,
      borderRadius: scale(16),
      width: scale(32),
      height: scale(32),
    },
    bellButton: {
      position: "relative",
    },
    badge: {
      position: "absolute",
      top: -scale(3),
      right: -scale(3),
      width: scale(14),
      height: scale(14),
      borderRadius: scale(7),
      backgroundColor: Colors[theme].danger,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    badgeText: {
      fontFamily: Fonts.family.bold,
      color: Colors[theme].white,
      fontSize: Fonts.size.h6,
      fontWeight: Fonts.weight.extraSemi,
    },
    statGrid: {
      flexDirection: "row",
      gap: scale(8),
      marginBottom: scale(16),
    },
    signatureCard: {
      marginBottom: scale(14),
      backgroundColor: Colors[theme].amberTint,
      borderColor: Colors[theme].amberBorder,
    },
    signatureRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(10),
    },
    signatureIconBox: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(9),
      backgroundColor: Colors[theme].orangeSoft,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    signatureText: {
      flex: 1,
    },
    signatureTitle: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.h4,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].text,
      marginTop: 0,
      marginHorizontal: 0,
      marginBottom: scale(1),
    },
    signatureSubtitle: {
      fontSize: Fonts.size.h5,
      color: Colors[theme].textSecondary,
    },
    list: {
      flexDirection: "column",
      gap: scale(7),
      marginBottom: scale(16),
    },
    docCard: {
      padding: scale(12),
    },
    docInfo: {
      flex: 1,
    },
    docName: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.h4,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].text,
      marginTop: 0,
      marginHorizontal: 0,
      marginBottom: scale(3),
    },
    docMeta: {
      fontSize: Fonts.size.h5,
      color: Colors[theme].textSecondary,
    },
    teamRow: {
      flexDirection: "row",
      gap: scale(10),
      paddingBottom: scale(4),
    },
  });

export default styles;
