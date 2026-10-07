import { StyleSheet } from 'react-native';

import { Colors, Fonts, scale, type ThemeMode } from '../theme';

// Tab bar height without the bottom safe-area inset, which is added at runtime.
export const TAB_BAR_BASE_HEIGHT = scale(66);

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    tabBar: {
      backgroundColor: Colors[theme].white,
      borderTopWidth: scale(1),
      borderTopColor: Colors[theme].line,
      elevation: 0,
      shadowOpacity: 0
    },
    tabBarItem: {
      paddingTop: scale(6)
    },
    tabBarLabel: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.h5,
      paddingTop: scale(4)
    }
  });

export default styles;
