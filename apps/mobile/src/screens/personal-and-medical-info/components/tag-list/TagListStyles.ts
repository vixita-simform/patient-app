import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    // design-drift[flexDirection]: .chips-wrap compiles with no flexDirection (web row default); RN defaults to column, so it is set explicitly here.
    chipsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(8),
    },
    // design-drift[flexDirection]: .chip.soft compiles with no flexDirection (web row default); RN defaults to column, so it is set explicitly here.
    chipSoft: {
      flexDirection: "row",
      backgroundColor: Colors[theme].greenSoft,
      borderWidth: scale(1),
      borderColor: Colors[theme].transparent,
      alignItems: "center",
      gap: scale(6),
      paddingVertical: scale(8),
      paddingHorizontal: scale(14),
      borderRadius: scale(20),
    },
    chipDashed: {
      backgroundColor: Colors[theme].card,
      borderWidth: scale(1),
      borderStyle: "dashed",
      borderColor: Colors[theme].green,
      paddingVertical: scale(8),
      paddingHorizontal: scale(14),
      borderRadius: scale(20),
    },
    chipDisabled: {
      opacity: 0.5,
    },
    chipText: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.h4,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].green,
    },
  });

export default styles;
