import { StyleSheet } from 'react-native';

import { Colors, Fonts, scale, type ThemeMode } from '../../../../theme';

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    group: {
      flexDirection: 'column',
      gap: scale(10)
    },
    groupLabel: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h4,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].muted
    },
    card: {
      backgroundColor: Colors[theme].card,
      borderWidth: scale(1),
      borderColor: Colors[theme].line,
      paddingHorizontal: scale(16),
      paddingVertical: scale(2),
      borderRadius: scale(18)
    },
    divider: {
      borderTopWidth: scale(1),
      borderTopColor: Colors[theme].line
    }
  });

export default styles;
