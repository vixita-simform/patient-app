import { StyleSheet } from 'react-native';

import { Colors, Fonts, scale, type ThemeMode } from '../../theme';

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    avatar: {
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    avatarCompact: {
      width: scale(44),
      height: scale(44),
      borderRadius: scale(22)
    },
    avatarRegular: {
      width: scale(48),
      height: scale(48),
      borderRadius: scale(24)
    },
    avatarLarge: {
      width: scale(64),
      height: scale(64),
      borderRadius: scale(32)
    },
    avatarXLarge: {
      width: scale(88),
      height: scale(88),
      borderRadius: scale(44)
    },
    avatarText: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f16,
      color: Colors[theme].white
    },
    avatarTextLarge: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f22,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].white
    },
    avatarTextXLarge: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f28,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].white
    },
    avatarNavy: {
      backgroundColor: Colors[theme].navy
    },
    avatarGreen: {
      backgroundColor: Colors[theme].green
    },
    avatarBlue: {
      backgroundColor: Colors[theme].blue
    },
    avatarAmber: {
      backgroundColor: Colors[theme].amber
    }
  });

export default styles;
