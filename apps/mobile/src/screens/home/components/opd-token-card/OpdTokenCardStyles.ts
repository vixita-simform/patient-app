import { StyleSheet } from 'react-native';

import { Colors, Fonts, scale, type ThemeMode } from '../../../../theme';

const TOKEN_NUMBER_SPACING = scale(-2.56);

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    token: {
      backgroundColor: Colors[theme].navy,
      flexDirection: 'column',
      gap: scale(16),
      padding: scale(20),
      borderRadius: scale(22)
    },
    rowBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    colGap4: {
      flexDirection: 'column',
      gap: scale(4)
    },
    colGap4End: {
      flexDirection: 'column',
      gap: scale(4),
      alignItems: 'flex-end'
    },
    tokenLabel: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.h4,
      color: Colors[theme].slate
    },
    tokenNumber: {
      fontFamily: Fonts.family.extraBold,
      fontSize: Fonts.size.f64,
      letterSpacing: TOKEN_NUMBER_SPACING,
      lineHeight: Fonts.size.f64,
      color: Colors[theme].white
    },
    tokenServing: {
      fontFamily: Fonts.family.extraBold,
      fontSize: Fonts.size.f28,
      color: Colors[theme].white
    },
    tokenWait: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h4,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].mint
    }
  });

export default styles;
