import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../theme";

// Caps Dynamic Type growth of the tab label so it fits the fixed-height bar below.
export const TAB_LABEL_MAX_FONT_SIZE_MULTIPLIER = 1.3;
// Tab bar height without the bottom safe-area inset, which is added at runtime:
// bar padding 5 + 8, item padding 4 + 4, icon 18, gap 2, label line ~15 (9pt at the
// 1.3 max font scale), gap 2, dot 3. Reserving the scaled line keeps large text from clipping.
export const TAB_BAR_BASE_HEIGHT = scale(61);
// Bottom padding of the bar before the safe-area inset is added.
export const TAB_BAR_BOTTOM_PADDING = scale(8);
export const TAB_ICON_SIZE = scale(18);

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    tabBar: {
      backgroundColor: Colors[theme].card,
      borderTopWidth: scale(1),
      borderTopColor: Colors[theme].border,
      paddingTop: scale(5),
      elevation: 0,
      shadowOpacity: 0,
    },
    tabBarItem: {
      paddingVertical: scale(4),
      paddingHorizontal: scale(10),
    },
    tabBarIcon: {
      width: TAB_ICON_SIZE,
      height: TAB_ICON_SIZE,
    },
    tabBarLabelWrap: {
      alignItems: "center",
      marginTop: scale(2),
    },
    tabBarLabel: {
      fontFamily: Fonts.family.medium,
      fontSize: Fonts.size.h6,
      fontWeight: Fonts.weight.low,
    },
    tabBarLabelActive: {
      fontFamily: Fonts.family.bold,
      fontWeight: Fonts.weight.extraSemi,
    },
    tabBarDot: {
      width: scale(3),
      height: scale(3),
      borderRadius: scale(1.5),
      marginTop: scale(2),
      backgroundColor: Colors[theme].primary,
    },
  });

export default styles;
