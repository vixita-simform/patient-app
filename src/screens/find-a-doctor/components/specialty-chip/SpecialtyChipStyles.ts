import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
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
      fontWeight: Fonts.weight.semi,
      fontSize: Fonts.size.h4,
      color: Colors[theme].navy,
    },
    chipTextActive: {
      color: Colors[theme].white,
    },
  });

export default styles;
