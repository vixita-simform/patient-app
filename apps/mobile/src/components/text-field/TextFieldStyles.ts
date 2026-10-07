import { StyleSheet } from 'react-native';

import { Colors, Fonts, scale, type ThemeMode } from '../../theme';

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    input: {
      flexDirection: 'row',
      height: scale(52),
      backgroundColor: Colors[theme].card,
      borderWidth: scale(1),
      borderColor: Colors[theme].line,
      alignItems: 'center',
      gap: scale(12),
      paddingVertical: 0,
      paddingHorizontal: scale(14),
      borderRadius: scale(14)
    },
    inputFocus: {
      borderWidth: scale(1.5),
      borderColor: Colors[theme].green
    },
    inputError: {
      borderWidth: scale(1.5),
      borderColor: Colors[theme].coral
    },
    textInput: {
      flex: 1,
      minWidth: 0,
      height: '100%',
      padding: 0,
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.h3,
      color: Colors[theme].navy
    },
    // Pressable mode: taps fall through to the wrapping Pressable instead of focusing the input.
    noPointerEvents: {
      pointerEvents: 'none'
    },
    trailingText: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.h4,
      color: Colors[theme].muted
    }
  });

export default styles;
