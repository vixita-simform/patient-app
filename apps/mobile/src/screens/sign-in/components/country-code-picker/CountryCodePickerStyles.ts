import { StyleSheet } from "react-native";

import { Colors, Fonts, height, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    trigger: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
    },
    dialCode: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h3,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy,
    },
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    backdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: Colors[theme].navyAlpha40,
    },
    sheet: {
      maxHeight: height * 0.6,
      backgroundColor: Colors[theme].card,
      paddingTop: scale(8),
      borderTopLeftRadius: scale(24),
      borderTopRightRadius: scale(24),
    },
    sheetHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: scale(12),
      paddingHorizontal: scale(20),
    },
    sheetTitle: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h2,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy,
    },
    list: {
      flexShrink: 1,
    },
    listContent: {
      paddingBottom: scale(24),
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(12),
      paddingVertical: scale(14),
      paddingHorizontal: scale(20),
    },
    rowSelected: {
      backgroundColor: Colors[theme].greenSoft,
    },
    flag: {
      fontSize: Fonts.size.h1,
    },
    countryName: {
      flex: 1,
      fontFamily: Fonts.family.medium,
      fontSize: Fonts.size.h3,
      fontWeight: Fonts.weight.low,
      color: Colors[theme].navy,
    },
    rowDialCode: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.h3,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].muted,
    },
  });

export default styles;
