import { StyleSheet } from 'react-native';

import { Colors, Fonts, scale, type ThemeMode } from '../../theme';

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    screen: {
      flex: 1
    },
    markAllRead: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h4,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].green
    },
    markAllReadDisabled: {
      color: Colors[theme].muted
    },
    body: {
      flex: 1
    },
    bodyContent: {
      paddingTop: scale(4),
      paddingRight: scale(20),
      paddingBottom: scale(24),
      paddingLeft: scale(20),
      gap: scale(18)
    }
  });

export default styles;
