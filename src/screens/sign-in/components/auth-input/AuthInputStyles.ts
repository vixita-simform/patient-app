import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    field: {
      flexDirection: "column",
      gap: scale(8),
    },
    fieldLabel: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.h4,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].bodySlate,
    },
    input: {
      height: scale(52),
      flexDirection: "row",
      backgroundColor: Colors[theme].card,
      borderWidth: scale(1),
      borderColor: Colors[theme].line,
      alignItems: "center",
      gap: scale(12),
      paddingVertical: 0,
      paddingHorizontal: scale(14),
      borderRadius: scale(14),
    },
    inputFocus: {
      borderWidth: scale(1.5),
      borderColor: Colors[theme].green,
    },
    inputError: {
      borderWidth: scale(1.5),
      borderColor: Colors[theme].coral,
    },
    vLine: {
      width: scale(1),
      height: scale(24),
      backgroundColor: Colors[theme].line,
    },
    textInput: {
      flex: 1,
      height: "100%",
      padding: 0,
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.h3,
      color: Colors[theme].navy,
    },
    errorText: {
      fontFamily: Fonts.family.medium,
      fontSize: Fonts.size.f12,
      fontWeight: Fonts.weight.low,
      color: Colors[theme].coral,
    },
  });

export default styles;
