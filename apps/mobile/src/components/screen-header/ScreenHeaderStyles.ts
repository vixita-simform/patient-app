import { StyleSheet } from 'react-native';

import { Colors, Fonts, scale, type ThemeMode } from '../../theme';

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: scale(12),
      paddingTop: scale(6),
      paddingRight: scale(20),
      paddingBottom: scale(10),
      paddingLeft: scale(20),
      flexShrink: 0
    },
    title: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.header,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy
    },
    titleLarge: {
      flex: 1,
      fontSize: Fonts.size.f22
    },
    // Same footprint as IconButton, so a centred title stays centred when a slot is empty.
    slotSpacer: {
      width: scale(40),
      height: scale(40)
    }
  });

export default styles;
