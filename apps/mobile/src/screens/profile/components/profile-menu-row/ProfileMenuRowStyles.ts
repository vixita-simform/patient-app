import { StyleSheet } from 'react-native';

import { Colors, Fonts, scale, type ThemeMode } from '../../../../theme';

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(12),
      paddingVertical: scale(12),
      paddingHorizontal: 0
    },
    menuItemDivider: {
      borderTopWidth: scale(1),
      borderTopColor: Colors[theme].line
    },
    pressed: {
      opacity: 0.7
    },
    disabled: {
      opacity: 0.5
    },
    tTitle: {
      flex: 1,
      minWidth: 0,
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h3,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy
    },
    badge: {
      paddingVertical: scale(4),
      paddingHorizontal: scale(10),
      borderRadius: scale(10),
      backgroundColor: Colors[theme].greyBadge
    },
    badgeText: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f12,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].muted
    }
  });

export default styles;
