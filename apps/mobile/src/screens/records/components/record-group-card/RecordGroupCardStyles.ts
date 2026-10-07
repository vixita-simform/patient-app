import { StyleSheet } from 'react-native';

import { Colors, scale, type ThemeMode } from '../../../../theme';

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    card: {
      backgroundColor: Colors[theme].card,
      borderWidth: scale(1),
      borderColor: Colors[theme].line,
      padding: scale(16),
      borderRadius: scale(18),
      flexDirection: 'column',
      gap: scale(16)
    },
    divider: {
      height: scale(1),
      backgroundColor: Colors[theme].line
    }
  });

export default styles;
