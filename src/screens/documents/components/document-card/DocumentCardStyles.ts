import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    card: {
      paddingVertical: scale(12),
      paddingHorizontal: scale(12),
    },
    info: {
      marginBottom: scale(7),
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
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    fileInfo: {
      fontSize: Fonts.size.small,
      color: Colors[theme].textSecondary,
    },
    downloadButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(3),
      paddingVertical: scale(3),
      paddingHorizontal: scale(9),
      borderRadius: scale(5),
      borderWidth: scale(1),
      borderColor: Colors[theme].border,
      backgroundColor: Colors[theme].background,
    },
    downloadText: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.small,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].primary,
    },
  });

export default styles;
