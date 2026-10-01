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
    chip: {
      backgroundColor: Colors[theme].card,
      borderWidth: scale(1),
      borderColor: Colors[theme].line,
      paddingVertical: scale(8),
      paddingHorizontal: scale(14),
      borderRadius: scale(20),
    },
    chipActive: {
      backgroundColor: Colors[theme].navy,
      borderColor: Colors[theme].navy,
    },
    chipText: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.h4,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].navy,
    },
    chipTextActive: {
      color: Colors[theme].white,
    },
  });

export default styles;
