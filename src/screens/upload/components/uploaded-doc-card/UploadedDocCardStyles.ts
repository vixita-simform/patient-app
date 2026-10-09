import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    card: {
      padding: scale(12),
    },
    info: {
      marginBottom: scale(8),
      minWidth: 0,
    },
    infoOnly: {
      minWidth: 0,
    },
    name: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.h4,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].text,
      marginBottom: scale(3),
    },
    meta: {
      fontSize: Fonts.size.h5,
      color: Colors[theme].textSecondary,
    },
    replaceButton: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: scale(4),
      paddingVertical: scale(4),
      paddingHorizontal: scale(10),
      borderRadius: scale(6),
      borderWidth: scale(1),
      borderColor: Colors[theme].border,
      backgroundColor: Colors[theme].background,
    },
    replaceText: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.small,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].primary,
    },
  });

export default styles;
