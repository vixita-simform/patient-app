import { StyleSheet } from 'react-native';

import { Colors, Fonts, scale, type ThemeMode } from '../../../../theme';

/**
 * Style factory for `MedicineCard`: icon box, name + badge, dosage line and
 * the stock progress bar (+ the outline "Order refill" button on card 3).
 * @param {ThemeMode} theme - active theme mode.
 * @returns the style sheet.
 */
const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    card: {
      flexDirection: 'column',
      backgroundColor: Colors[theme].card,
      borderWidth: scale(1),
      borderColor: Colors[theme].line,
      padding: scale(16),
      borderRadius: scale(18),
      gap: scale(12)
    },
    // design-drift[flexDirection]: spec's `.med` has no flexDirection rule (CSS default row, unverified without a screenshot)
    med: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: scale(12)
    },
    info: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'column',
      gap: scale(4)
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    name: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h3,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy
    },
    dosage: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.h4,
      color: Colors[theme].muted
    },
    stockBlock: {
      flexDirection: 'column',
      gap: scale(4)
    },
    stockLabel: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.f12,
      color: Colors[theme].muted
    },
    // Local stock bar: spec needs a per-medicine fill color, 6px height and a
    // token less track color (`#E6ECE9` -> `rangeTrack`, closest existing match).
    // The shared `ProgressBar` fixes both height (8) and fill color (mint), so
    // it cannot express this without a style override it doesn't accept.
    stockTrack: {
      height: scale(6),
      backgroundColor: Colors[theme].rangeTrack,
      overflow: 'hidden',
      borderRadius: scale(3)
    },
    stockFill: {
      height: '100%',
      borderRadius: scale(3)
    },
    stockFillGreen: {
      backgroundColor: Colors[theme].green
    },
    stockFillBlue: {
      backgroundColor: Colors[theme].blue
    },
    stockFillCoral: {
      backgroundColor: Colors[theme].coral
    },
    refillButton: {
      width: '100%',
      paddingHorizontal: scale(14),
      borderRadius: scale(12),
      paddingVertical: scale(10)
    },
    orderRefillText: {
      fontSize: Fonts.size.f14
    }
  });

export default styles;
