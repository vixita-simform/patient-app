import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    single: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8),
      paddingVertical: scale(10),
      paddingHorizontal: scale(12),
      borderRadius: scale(9),
      backgroundColor: Colors[theme].background,
      borderWidth: 1,
      borderColor: Colors[theme].border,
    },
    singleText: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.f12,
      color: Colors[theme].text,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(10),
      paddingVertical: scale(11),
      paddingHorizontal: scale(12),
      marginBottom: scale(6),
      borderRadius: scale(10),
      backgroundColor: Colors[theme].card,
      borderWidth: 1.5,
      borderColor: Colors[theme].border,
    },
    rowOn: {
      backgroundColor: Colors[theme].limeSoft,
      borderColor: Colors[theme].primary,
    },
    checkbox: {
      width: scale(19),
      height: scale(19),
      borderRadius: scale(5),
      borderWidth: 2,
      borderColor: Colors[theme].checkboxBorder,
      backgroundColor: Colors[theme].transparent,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    checkboxOn: {
      borderColor: Colors[theme].primary,
      backgroundColor: Colors[theme].primary,
    },
    info: {
      flex: 1,
      minWidth: 0,
    },
    label: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.f12,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].text,
    },
    desc: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.small,
      color: Colors[theme].textSecondary,
    },
    hint: {
      marginTop: scale(2),
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.small,
      fontWeight: Fonts.weight.semiLow,
      color: Colors[theme].textSecondary,
    },
    hintError: {
      fontFamily: Fonts.family.semiBold,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].error,
    },
  });

export default styles;
