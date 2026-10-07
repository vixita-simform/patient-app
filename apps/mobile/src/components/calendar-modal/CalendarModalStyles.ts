import { StyleSheet } from 'react-native';

import { Colors, Fonts, scale, type ThemeMode } from '../../theme';

/**
 * Styles for `CalendarModal`, the iOS date-picker bottom sheet.
 * @param {ThemeMode} theme - active theme mode.
 * @returns style sheet for `CalendarModal`.
 */
const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: Colors[theme].navyAlpha40
    },
    sheet: {
      backgroundColor: Colors[theme].card,
      borderTopLeftRadius: scale(20),
      borderTopRightRadius: scale(20),
      paddingBottom: scale(24)
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: scale(14),
      paddingRight: scale(20),
      paddingBottom: scale(10),
      paddingLeft: scale(20),
      borderBottomWidth: scale(1),
      borderBottomColor: Colors[theme].line
    },
    headerText: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.f14,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].green
    },
    body: {
      alignItems: 'center'
    }
  });

export default styles;
