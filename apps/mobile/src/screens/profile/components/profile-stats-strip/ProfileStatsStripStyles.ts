import { StyleSheet } from 'react-native';

import { Colors, Fonts, scale, type ThemeMode } from '../../../../theme';

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    stats: {
      flexDirection: 'row',
      backgroundColor: Colors[theme].card,
      borderWidth: scale(1),
      borderColor: Colors[theme].line,
      borderRadius: scale(18)
    },
    stat: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      gap: scale(2),
      paddingVertical: scale(14),
      paddingHorizontal: scale(4)
    },
    statDivider: {
      borderLeftWidth: scale(1),
      borderLeftColor: Colors[theme].line
    },
    statValue: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h2,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy
    },
    tXs: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.f12,
      color: Colors[theme].muted
    }
  });

export default styles;
