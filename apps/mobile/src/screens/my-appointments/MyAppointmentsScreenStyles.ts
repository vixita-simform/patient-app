import { StyleSheet } from 'react-native';

import { Colors, Fonts, scale, type ThemeMode } from '../../theme';

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    screen: {
      flex: 1
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
    },
    listHeader: {
      paddingBottom: scale(18)
    },
    stateText: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.h4,
      color: Colors[theme].muted,
      textAlign: 'center',
      paddingTop: scale(24)
    }
  });

export default styles;
