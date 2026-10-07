import { StyleSheet } from 'react-native';

import { Colors, Fonts, scale, type ThemeMode } from '../../../../theme';

/**
 * Styles for a visit-type selection card (In-person / Video call).
 * @param {ThemeMode} theme - active theme mode.
 * @returns style sheet for `VisitTypeCard`.
 */
const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    visit: {
      flex: 1,
      borderWidth: scale(1.5),
      borderColor: Colors[theme].line,
      backgroundColor: Colors[theme].card,
      flexDirection: 'column',
      gap: scale(8),
      padding: scale(14),
      borderRadius: scale(16)
    },
    visitActive: {
      borderColor: Colors[theme].green,
      backgroundColor: Colors[theme].background
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    radio: {
      width: scale(20),
      height: scale(20),
      borderWidth: scale(2),
      borderColor: Colors[theme].line,
      borderRadius: scale(10)
    },
    visitActiveRadio: {
      borderWidth: scale(6),
      borderColor: Colors[theme].green
    },
    title: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h3,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy
    },
    subtitle: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.f12,
      color: Colors[theme].muted
    }
  });

export default styles;
