import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    body: {
      flex: 1,
    },
    bodyContent: {
      flexDirection: "column",
      paddingTop: scale(28),
      paddingRight: scale(20),
      paddingBottom: scale(24),
      paddingLeft: scale(20),
      gap: scale(22),
    },
    brandBlock: {
      flexDirection: "column",
      gap: scale(16),
    },
    logoMark: {
      width: scale(56),
      height: scale(56),
      backgroundColor: Colors[theme].green,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: scale(18),
    },
    headingGroup: {
      flexDirection: "column",
      gap: scale(8),
    },
    eyebrow: {
      fontFamily: Fonts.family.extraBold,
      fontSize: Fonts.size.f12,
      fontWeight: Fonts.weight.extraBold,
      letterSpacing: scale(1.2),
      color: Colors[theme].green,
    },
    authTitle: {
      fontFamily: Fonts.family.extraBold,
      fontSize: Fonts.size.f28,
      fontWeight: Fonts.weight.extraBold,
      letterSpacing: scale(-0.56),
      lineHeight: scale(32),
      color: Colors[theme].navy,
    },
    subtitle: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.h4,
      color: Colors[theme].muted,
    },
    // design-drift[flexDirection]: .or-row compiles with no flexDirection (web row default); RN defaults to column, so it is set explicitly here.
    orRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(12),
    },
    // Separates the country-code picker from the number inside the phone field.
    vLine: {
      width: scale(1),
      height: scale(24),
      backgroundColor: Colors[theme].line,
    },
    divider: {
      flex: 1,
      minWidth: 0,
      height: scale(1),
      backgroundColor: Colors[theme].line,
    },
    textXs: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.f12,
      color: Colors[theme].muted,
    },
    infoCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(12),
      backgroundColor: Colors[theme].blueSoft,
      borderWidth: scale(1),
      borderColor: Colors[theme].transparent,
      padding: scale(16),
      borderRadius: scale(18),
    },
    infoText: {
      flex: 1,
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.h4,
      lineHeight: scale(19),
      color: Colors[theme].infoInk,
    },
    // Nested inside infoText, so size, line height and colour are inherited.
    infoTextBold: {
      fontFamily: Fonts.family.bold,
      fontWeight: Fonts.weight.extraSemi,
    },
    emergencyRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(8),
    },
    emergencyText: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f14,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].coral,
    },
  });

export default styles;
