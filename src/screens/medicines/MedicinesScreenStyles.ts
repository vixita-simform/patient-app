import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../theme";

/**
 * Style factory for `MedicinesScreen`: header, "Today's doses" summary card,
 * "Active prescription" section title and the medicine card list.
 * @param {ThemeMode} theme - active theme mode.
 * @returns the style sheet.
 */
const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: scale(6),
      paddingRight: scale(20),
      paddingBottom: scale(10),
      paddingLeft: scale(20),
    },
    headerTitle: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.header,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy,
    },
    body: {
      flex: 1,
    },
    bodyContent: {
      paddingTop: scale(4),
      paddingRight: scale(20),
      paddingBottom: scale(24),
      paddingLeft: scale(20),
      gap: scale(18),
    },
    card: {
      flexDirection: "column",
      backgroundColor: Colors[theme].card,
      borderWidth: scale(1),
      borderColor: Colors[theme].line,
      padding: scale(16),
      borderRadius: scale(18),
      gap: scale(12),
    },
    dosesHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    dosesTitle: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h3,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy,
    },
    dosesSubtitle: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.h4,
      color: Colors[theme].muted,
    },
    // design-drift[flexDirection]: spec's `.section-title` has no flexDirection rule (CSS default row, unverified without a screenshot)
    sectionTitle: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
    sectionTitleH3: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f16,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy,
    },
    sectionTitleSub: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.f12,
      color: Colors[theme].muted,
    },
    medicineList: {
      flexDirection: "column",
      gap: scale(18),
    },
  });

export default styles;
