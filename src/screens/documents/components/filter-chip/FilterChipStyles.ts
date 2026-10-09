import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    chip: {
      flexShrink: 0,
      paddingVertical: scale(5),
      paddingHorizontal: scale(12),
      borderRadius: scale(16),
      borderWidth: scale(1),
      borderColor: Colors[theme].border,
      backgroundColor: Colors[theme].card,
    },
    chipActive: {
      borderColor: Colors[theme].primary,
      backgroundColor: Colors[theme].primary,
    },
    chipText: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.h5,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].text,
    },
    chipTextActive: {
      color: Colors[theme].white,
    },
  });

export default styles;
