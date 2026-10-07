import { StyleSheet } from 'react-native';

import { Colors, Fonts, scale, type ThemeMode } from '../../../../theme';
import { RANGE_BAND } from './LabResultRowConstants';

/** Marker diameter; the rail is inset by half of it so the marker never overhangs the track. */
const MARKER_SIZE = scale(14);
const MARKER_HALF = MARKER_SIZE / 2;

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    result: {
      flexDirection: 'column',
      gap: scale(8),
      paddingVertical: scale(14),
      paddingHorizontal: 0
    },
    resultDivider: {
      borderTopWidth: scale(1),
      borderTopColor: Colors[theme].line
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    tTitle: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h3,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    resultValue: {
      fontFamily: Fonts.family.extraBold,
      fontSize: Fonts.size.f22,
      fontWeight: Fonts.weight.extraBold,
      color: Colors[theme].navy
    },
    tXs: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.f12,
      color: Colors[theme].muted
    },
    range: {
      height: scale(6),
      // design-drift[backgroundColor]: literal '#E6ECE9' has no matching token; added Colors.rangeTrack
      backgroundColor: Colors[theme].rangeTrack,
      position: 'relative',
      borderRadius: scale(3)
    },
    // Inset rail that both the band and the marker are positioned in: the marker is
    // centred on its percent (translateX below), so a half-marker inset on each side
    // keeps it inside the track at 0% and 100%.
    rangeRail: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: MARKER_HALF,
      right: MARKER_HALF
    },
    rangeOk: {
      position: 'absolute',
      left: `${RANGE_BAND.start}%`,
      width: `${RANGE_BAND.width}%`,
      height: '100%',
      // design-drift[backgroundColor]: literal '#BFE0D6' has no matching token; added Colors.rangeNormalBand
      backgroundColor: Colors[theme].rangeNormalBand,
      borderRadius: scale(3)
    },
    rangeMark: {
      position: 'absolute',
      top: scale(-4),
      width: MARKER_SIZE,
      height: MARKER_SIZE,
      transform: [{ translateX: -MARKER_HALF }],
      borderWidth: scale(3),
      borderColor: Colors[theme].white,
      // design-drift[box-shadow]: CSS `0 0 0 1px #DDE5E1` ring; RN shadow can't reproduce a
      // zero-blur outline, so this approximates it as a soft single-layer shadow.
      shadowColor: Colors[theme].line,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 1,
      borderRadius: scale(7)
    },
    markCoral: {
      backgroundColor: Colors[theme].coral
    },
    markGreen: {
      backgroundColor: Colors[theme].green
    },
    markAmber: {
      backgroundColor: Colors[theme].amber
    }
  });

export default styles;
