import { StyleSheet } from 'react-native';

import { Colors, Fonts, scale, type ThemeMode } from '../../../../theme';

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    card: {
      flexDirection: 'column',
      backgroundColor: Colors[theme].card,
      borderWidth: scale(1),
      borderColor: Colors[theme].line,
      padding: scale(16),
      borderRadius: scale(18)
    },
    cardTitle: {
      fontFamily: Fonts.family.bold,
      fontWeight: Fonts.weight.extraSemi,
      fontSize: Fonts.size.f16,
      color: Colors[theme].navy,
      marginBottom: scale(6)
    },
    hoursRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: scale(8)
    },
    hoursLabel: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.f14,
      color: Colors[theme].navy
    },
    hoursValue: {
      fontFamily: Fonts.family.bold,
      fontWeight: Fonts.weight.extraSemi,
      fontSize: Fonts.size.f14,
      color: Colors[theme].navy
    },
    textSub: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.h4,
      color: Colors[theme].muted
    },
    divider: {
      height: scale(1),
      backgroundColor: Colors[theme].line
    }
  });

export default styles;
