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
    sourceRow: {
      flexDirection: "row",
      gap: scale(8),
      marginBottom: scale(10),
    },
    fileHint: {
      fontSize: Fonts.size.small,
      color: Colors[theme].textSecondary,
      textAlign: "center",
      marginBottom: scale(14),
    },
    fieldLabel: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.h5,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].textSecondary,
      textTransform: "uppercase",
      letterSpacing: Fonts.letterSpacing.wide,
      marginBottom: scale(6),
    },
    typeSelect: {
      padding: scale(12),
      marginBottom: scale(14),
    },
    typeSelectVerif: {
      padding: scale(12),
      marginBottom: scale(8),
    },
    typeSelectRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(10),
    },
    typeIconBox: {
      width: scale(34),
      height: scale(34),
      borderRadius: scale(9),
      backgroundColor: Colors[theme].primaryTint,
      alignItems: "center",
      justifyContent: "center",
    },
    typeSelectTextWrap: {
      flex: 1,
    },
    typeSelectText: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.h4,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].text,
    },
    typeSelectPlaceholder: {
      color: Colors[theme].textSecondary,
    },
    verifNotice: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(7),
      backgroundColor: Colors[theme].primaryTint,
      borderWidth: scale(1),
      borderColor: Colors[theme].blueBorder,
      borderRadius: scale(8),
      paddingVertical: scale(8),
      paddingHorizontal: scale(10),
      marginBottom: scale(14),
    },
    verifNoticeText: {
      flex: 1,
      fontSize: Fonts.size.h5,
      color: Colors[theme].teal,
    },
    recipientWrap: {
      marginBottom: scale(14),
    },
    submitButton: {
      alignSelf: "stretch",
      alignItems: "center",
      padding: scale(12),
      borderRadius: scale(8),
      backgroundColor: Colors[theme].primary,
      marginBottom: scale(20),
    },
    submitButtonDisabled: {
      backgroundColor: Colors[theme].border,
    },
    submitButtonText: {
      color: Colors[theme].white,
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f14,
      fontWeight: Fonts.weight.extraSemi,
    },
    submitButtonTextDisabled: {
      color: Colors[theme].textSecondary,
    },
    uploadingCard: {
      padding: scale(28),
      alignItems: "center",
      marginTop: scale(14),
      marginBottom: scale(16),
    },
    spinnerBox: {
      width: scale(40),
      height: scale(40),
      alignItems: "center",
      justifyContent: "center",
      marginBottom: scale(14),
    },
    uploadingTitle: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.f14,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].text,
      marginBottom: scale(3),
      textAlign: "center",
    },
    uploadingSubtitle: {
      fontSize: Fonts.size.h5,
      color: Colors[theme].textSecondary,
      textAlign: "center",
    },
    docList: {
      gap: scale(7),
    },
    loadMoreButton: {
      alignSelf: "stretch",
      alignItems: "center",
      marginTop: scale(10),
      padding: scale(11),
      borderRadius: scale(9),
      borderWidth: scale(1),
      borderColor: Colors[theme].primary,
      backgroundColor: Colors[theme].card,
    },
    loadMoreText: {
      color: Colors[theme].primary,
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h4,
      fontWeight: Fonts.weight.extraSemi,
    },
  });

export default styles;
