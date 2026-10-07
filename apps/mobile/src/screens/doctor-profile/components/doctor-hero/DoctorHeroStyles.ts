import { StyleSheet } from 'react-native';

import { Colors, Fonts, scale, type ThemeMode } from '../../../../theme';

// The design's hero bottom padding (28) minus the 18 the stats card overlaps;
// the overlap band itself lives in the scroll content.
const HERO_BOTTOM_PADDING = 10;

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    hero: {
      backgroundColor: Colors[theme].green,
      paddingTop: scale(8),
      paddingRight: scale(20),
      paddingBottom: scale(HERO_BOTTOM_PADDING),
      paddingLeft: scale(20),
      flexDirection: 'column',
      alignItems: 'center',
      gap: scale(10)
    },
    heroTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%'
    },
    heroIconButton: {
      width: scale(40),
      height: scale(40),
      borderWidth: scale(1),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: scale(12),
      backgroundColor: Colors[theme].whiteAlpha15,
      borderColor: Colors[theme].transparent
    },
    heroAvatar: {
      width: scale(96),
      height: scale(96),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors[theme].white,
      borderRadius: scale(48)
    },
    heroAvatarText: {
      fontFamily: Fonts.family.bold,
      fontWeight: Fonts.weight.extraSemi,
      fontSize: Fonts.size.f32,
      color: Colors[theme].green
    },
    heroNameCol: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: scale(2)
    },
    heroName: {
      fontFamily: Fonts.family.extraBold,
      fontSize: Fonts.size.h1,
      fontWeight: Fonts.weight.extraBold,
      color: Colors[theme].white
    },
    heroQualification: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.h4,
      color: Colors[theme].paleMint
    }
  });

export default styles;
