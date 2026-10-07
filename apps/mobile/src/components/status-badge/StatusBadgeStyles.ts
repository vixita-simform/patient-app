import { StyleSheet } from 'react-native';

import { Colors, Fonts, scale, type ThemeMode } from '../../theme';

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    badge: {
      paddingVertical: scale(4),
      paddingHorizontal: scale(10),
      borderRadius: scale(10)
    },
    badgeText: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f12,
      fontWeight: Fonts.weight.extraSemi
    },
    badgeGreen: {
      backgroundColor: Colors[theme].greenSoft
    },
    badgeGreenText: {
      color: Colors[theme].green
    },
    badgeAmber: {
      backgroundColor: Colors[theme].amberSoft
    },
    badgeAmberText: {
      // design-drift[color]: literal '#A5660E' in source has no matching token; reusing existing amberInk token (same value)
      color: Colors[theme].amberInk
    },
    badgeCoral: {
      backgroundColor: Colors[theme].coralSoft
    },
    badgeCoralText: {
      // design-drift[color]: literal '#B63A17' in source has no matching token; added Colors.coralInk (same value)
      color: Colors[theme].coralInk
    }
  });

export default styles;
