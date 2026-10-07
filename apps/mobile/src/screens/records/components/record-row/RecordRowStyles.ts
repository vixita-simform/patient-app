import { StyleSheet } from 'react-native';

import { Colors, Fonts, scale, type ThemeMode } from '../../../../theme';

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    record: {
      flexDirection: 'row',
      gap: scale(12),
      alignItems: 'center'
    },
    info: {
      flexDirection: 'column',
      flex: 1,
      minWidth: 0
    },
    title: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h3,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy
    },
    subtitle: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.h4,
      color: Colors[theme].muted
    }
  });

export default styles;
