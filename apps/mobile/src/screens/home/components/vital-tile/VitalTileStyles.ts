import { StyleSheet } from 'react-native';

import { Colors, Fonts, scale, type ThemeMode } from '../../../../theme';

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    vital: {
      flex: 1,
      backgroundColor: Colors[theme].card,
      borderWidth: scale(1),
      borderColor: Colors[theme].line,
      flexDirection: 'column',
      gap: scale(6),
      padding: scale(12),
      borderRadius: scale(16)
    },
    vitalValueRow: {
      flexDirection: 'row',
      alignItems: 'baseline'
    },
    vitalValue: {
      fontFamily: Fonts.family.extraBold,
      fontSize: Fonts.size.h1,
      color: Colors[theme].navy
    },
    vitalUnit: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.h5,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].muted,
      marginLeft: scale(2)
    },
    textXs: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.f12,
      color: Colors[theme].muted
    }
  });

export default styles;
