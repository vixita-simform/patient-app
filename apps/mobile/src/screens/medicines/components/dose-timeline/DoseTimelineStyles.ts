import { StyleSheet } from 'react-native';

import { Colors, Fonts, scale, type ThemeMode } from '../../../../theme';

/**
 * Style factory for `DoseTimeline`: the 4-chip "Today's doses" strip.
 * @param {ThemeMode} theme - active theme mode.
 * @returns the style sheet.
 */
const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    // design-drift[flexDirection]: spec's `.dose-strip` has no flexDirection rule (CSS default row, unverified without a screenshot)
    doseStrip: {
      flexDirection: 'row',
      gap: scale(8)
    },
    dose: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      gap: scale(4),
      backgroundColor: Colors[theme].background,
      paddingVertical: scale(10),
      paddingHorizontal: scale(8),
      borderRadius: scale(14)
    },
    doseDone: {
      backgroundColor: Colors[theme].greenSoft
    },
    doseNext: {
      backgroundColor: Colors[theme].navy
    },
    doseTime: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.f12,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].navy
    },
    doseTimeDone: {
      color: Colors[theme].green
    },
    // design-drift[color]: spec's `.dose.next` text color is '#fff' with no token; `white` is the exact match
    doseTimeNext: {
      color: Colors[theme].white
    }
  });

export default styles;
