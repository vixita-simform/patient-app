import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    card: {
      padding: scale(24),
      alignItems: "center",
      marginBottom: scale(16),
      borderColor: Colors[theme].primary,
      backgroundColor: Colors[theme].limeSoft,
    },
    iconCircle: {
      width: scale(48),
      height: scale(48),
      borderRadius: scale(24),
      backgroundColor: Colors[theme].successStrong,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: scale(10),
    },
    title: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h3,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].primary,
      marginBottom: scale(3),
      textAlign: "center",
    },
    subtitle: {
      fontSize: Fonts.size.f12,
      color: Colors[theme].textSecondary,
      marginBottom: scale(8),
      textAlign: "center",
    },
    sentTo: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.h5,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].text,
      marginBottom: scale(14),
      textAlign: "center",
    },
    button: {
      paddingVertical: scale(9),
      paddingHorizontal: scale(18),
      borderRadius: scale(8),
      backgroundColor: Colors[theme].primary,
    },
    buttonText: {
      color: Colors[theme].white,
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.h4,
      fontWeight: Fonts.weight.semi,
    },
  });

export default styles;
