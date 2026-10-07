import { StyleSheet } from 'react-native';

import { Colors, scale, type ThemeMode } from '../../theme';

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    tokenProgress: {
      height: scale(8),
      backgroundColor: Colors[theme].whiteAlpha14,
      overflow: 'hidden',
      borderRadius: scale(4)
    },
    tokenProgressFill: {
      height: '100%',
      backgroundColor: Colors[theme].mint,
      borderRadius: scale(4)
    }
  });

export default styles;
