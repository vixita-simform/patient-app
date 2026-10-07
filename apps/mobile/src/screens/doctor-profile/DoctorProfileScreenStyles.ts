import { StyleSheet } from 'react-native';

import { Colors, Fonts, scale, type ThemeMode } from '../../theme';

const styles = (theme: ThemeMode) => {
  const card = {
    backgroundColor: Colors[theme].card,
    borderWidth: scale(1),
    borderColor: Colors[theme].line,
    padding: scale(16),
    borderRadius: scale(18)
  } as const;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: Colors[theme].background
    },
    heroSafeArea: {
      backgroundColor: Colors[theme].green
    },
    body: {
      flex: 1
    },
    bodyContent: {
      flexDirection: 'column'
    },
    overlapBand: {
      height: scale(18),
      backgroundColor: Colors[theme].green
    },
    bodyInner: {
      flexDirection: 'column',
      gap: scale(18),
      paddingTop: 0,
      paddingRight: scale(20),
      paddingBottom: scale(24),
      paddingLeft: scale(20)
    },
    aboutSection: {
      flexDirection: 'column',
      gap: scale(8)
    },
    sectionTitle: {
      fontFamily: Fonts.family.bold,
      fontWeight: Fonts.weight.extraSemi,
      fontSize: Fonts.size.f16,
      color: Colors[theme].navy
    },
    paragraph: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.f14,
      lineHeight: scale(22),
      color: Colors[theme].bodySlate
    },
    locationCard: {
      ...card,
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(12)
    },
    iconBoxBlue: {
      width: scale(44),
      height: scale(44),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: scale(14),
      backgroundColor: Colors[theme].blueSoft
    },
    locationTextCol: {
      flexDirection: 'column',
      flex: 1,
      minWidth: 0
    },
    textTitle: {
      fontFamily: Fonts.family.bold,
      fontWeight: Fonts.weight.extraSemi,
      fontSize: Fonts.size.h3,
      color: Colors[theme].navy
    },
    textSub: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.h4,
      color: Colors[theme].muted
    },
    feeCard: {
      ...card,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    col: {
      flexDirection: 'column'
    },
    textXs: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.f12,
      color: Colors[theme].muted
    },
    feeAmount: {
      fontFamily: Fonts.family.extraBold,
      fontWeight: Fonts.weight.extraBold,
      fontSize: Fonts.size.h1,
      color: Colors[theme].navy
    },
    stateText: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.f14,
      color: Colors[theme].muted,
      textAlign: 'center',
      padding: scale(24)
    },
    footerBar: {
      paddingTop: scale(14),
      paddingRight: scale(20),
      paddingLeft: scale(20),
      backgroundColor: Colors[theme].card,
      borderTopWidth: scale(1),
      borderTopColor: Colors[theme].line,
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(12)
    },
    footerIconButton: {
      width: scale(52),
      height: scale(52),
      backgroundColor: Colors[theme].card,
      borderWidth: scale(1),
      borderColor: Colors[theme].line,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: scale(16)
    },
    primaryButton: {
      height: scale(52),
      borderWidth: 0,
      alignItems: 'center',
      justifyContent: 'center',
      gap: scale(8),
      flex: 1,
      borderRadius: scale(16),
      backgroundColor: Colors[theme].green
    },
    primaryButtonText: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f16,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].white
    }
  });
};

export default styles;
