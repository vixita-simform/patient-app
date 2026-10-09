import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      paddingTop: 0,
      paddingHorizontal: scale(14),
      paddingBottom: scale(16),
    },
    header: {
      paddingTop: scale(12),
      paddingHorizontal: 0,
      paddingBottom: scale(10),
    },
    title: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.header,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].text,
      marginBottom: scale(3),
      letterSpacing: Fonts.letterSpacing.tight,
    },
    subtitle: {
      fontSize: Fonts.size.f12,
      color: Colors[theme].textSecondary,
    },
    searchRow: {
      flexDirection: "row",
      gap: scale(8),
      marginBottom: scale(10),
    },
    searchField: {
      position: "relative",
      flex: 1,
    },
    searchIconWrap: {
      position: "absolute",
      left: scale(10),
      top: 0,
      bottom: 0,
      justifyContent: "center",
      pointerEvents: "none",
    },
    searchInput: {
      paddingTop: scale(9),
      paddingRight: scale(12),
      paddingBottom: scale(9),
      paddingLeft: scale(32),
      borderRadius: scale(8),
      borderWidth: scale(1),
      borderColor: Colors[theme].border,
      backgroundColor: Colors[theme].card,
      fontSize: Fonts.size.h4,
      color: Colors[theme].text,
    },
    yearButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
      flexShrink: 0,
      paddingVertical: scale(9),
      paddingHorizontal: scale(12),
      borderRadius: scale(8),
      borderWidth: scale(1),
      borderColor: Colors[theme].border,
      backgroundColor: Colors[theme].card,
    },
    yearButtonActive: {
      borderColor: Colors[theme].primary,
      backgroundColor: Colors[theme].primarySoft,
    },
    yearButtonText: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.f12,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].text,
    },
    yearButtonTextActive: {
      color: Colors[theme].primary,
    },
    chipScroll: {
      marginBottom: scale(6),
      flexGrow: 0,
    },
    chipRow: {
      flexDirection: "row",
      gap: scale(5),
      paddingBottom: scale(10),
    },
    docList: {
      flexDirection: "column",
      gap: scale(7),
    },
    loadMoreButton: {
      alignSelf: "stretch",
      alignItems: "center",
      marginTop: scale(10),
      paddingVertical: scale(11),
      paddingHorizontal: scale(11),
      borderRadius: scale(9),
      borderWidth: scale(1),
      borderColor: Colors[theme].primary,
      backgroundColor: Colors[theme].card,
    },
    loadMoreText: {
      fontFamily: Fonts.family.bold,
      color: Colors[theme].primary,
      fontSize: Fonts.size.h4,
      fontWeight: Fonts.weight.extraSemi,
    },
    countText: {
      textAlign: "center",
      fontSize: Fonts.size.small,
      color: Colors[theme].textSecondary,
      marginTop: scale(8),
    },
  });

export default styles;
