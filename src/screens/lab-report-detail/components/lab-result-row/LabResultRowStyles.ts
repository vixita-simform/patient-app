import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    result: {
      flexDirection: "column",
      gap: scale(8),
      paddingVertical: scale(14),
      paddingHorizontal: 0,
    },
    resultDivider: {
      borderTopWidth: scale(1),
      borderTopColor: Colors[theme].line,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    tTitle: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h3,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy,
    },
    valueRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    resultValue: {
      fontFamily: Fonts.family.extraBold,
      fontSize: Fonts.size.f22,
      fontWeight: Fonts.weight.extraBold,
      color: Colors[theme].navy,
    },
    tXs: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.f12,
      color: Colors[theme].muted,
    },
    range: {
      height: scale(6),
      // design-drift[backgroundColor]: literal '#E6ECE9' has no matching token; added Colors.rangeTrack
      backgroundColor: Colors[theme].rangeTrack,
      position: "relative",
      borderRadius: scale(3),
    },
    rangeOk: {
      position: "absolute",
      left: "30%",
      width: "40%",
      height: "100%",
      // design-drift[backgroundColor]: literal '#BFE0D6' has no matching token; added Colors.rangeNormalBand
      backgroundColor: Colors[theme].rangeNormalBand,
      borderRadius: scale(3),
    },
    rangeMark: {
      position: "absolute",
      top: scale(-4),
      width: scale(14),
      height: scale(14),
      borderWidth: scale(3),
      borderColor: Colors[theme].white,
      // design-drift[box-shadow]: CSS `0 0 0 1px #DDE5E1` ring; RN shadow can't reproduce a
      // zero-blur outline, so this approximates it as a soft single-layer shadow.
      shadowColor: Colors[theme].line,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 1,
      borderRadius: scale(7),
    },
    markCoral: {
      backgroundColor: Colors[theme].coral,
    },
    markGreen: {
      backgroundColor: Colors[theme].green,
    },
    markAmber: {
      backgroundColor: Colors[theme].amber,
    },
  });

export default styles;
