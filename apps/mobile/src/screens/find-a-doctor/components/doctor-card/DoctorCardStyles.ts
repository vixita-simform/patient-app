import { StyleSheet } from 'react-native';

import { Colors, Fonts, scale, type ThemeMode } from '../../../../theme';

const BUTTON_BASE = Object.freeze({
  height: scale(38),
  alignItems: 'center',
  justifyContent: 'center',
  width: 'auto',
  paddingVertical: 0,
  paddingHorizontal: scale(14),
  borderRadius: scale(12)
} as const);

const BUTTON_TEXT_BASE = Object.freeze({
  fontFamily: Fonts.family.bold,
  fontWeight: Fonts.weight.extraSemi,
  fontSize: Fonts.size.f14
} as const);

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    card: {
      flexDirection: 'column',
      gap: scale(12),
      backgroundColor: Colors[theme].card,
      borderWidth: scale(1),
      borderColor: Colors[theme].line,
      padding: scale(16),
      borderRadius: scale(18)
    },
    pressArea: {
      flexDirection: 'column',
      gap: scale(12)
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(12)
    },
    info: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'column',
      gap: scale(4)
    },
    title: {
      fontFamily: Fonts.family.bold,
      fontWeight: Fonts.weight.extraSemi,
      fontSize: Fonts.size.h3,
      color: Colors[theme].navy
    },
    sub: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.h4,
      color: Colors[theme].muted
    },
    rating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(4)
    },
    ratingValue: {
      fontFamily: Fonts.family.bold,
      fontWeight: Fonts.weight.extraSemi,
      fontSize: Fonts.size.h4,
      color: Colors[theme].navy
    },
    xs: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.f12,
      color: Colors[theme].muted
    },
    divider: {
      height: scale(1),
      backgroundColor: Colors[theme].line
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    slotColumn: {
      flex: 1,
      flexDirection: 'column'
    },
    nextSlot: {
      fontFamily: Fonts.family.bold,
      fontWeight: Fonts.weight.extraSemi,
      fontSize: Fonts.size.f14,
      color: Colors[theme].navy
    },
    btnPrimary: {
      ...BUTTON_BASE,
      backgroundColor: Colors[theme].green
    },
    btnOutline: {
      ...BUTTON_BASE,
      backgroundColor: Colors[theme].transparent,
      borderWidth: scale(1.5),
      borderColor: Colors[theme].green
    },
    btnTextPrimary: {
      ...BUTTON_TEXT_BASE,
      color: Colors[theme].white
    },
    btnTextOutline: {
      ...BUTTON_TEXT_BASE,
      color: Colors[theme].green
    }
  });

export default styles;
