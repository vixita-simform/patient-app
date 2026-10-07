import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { STATUS_BADGE_TONE, type StatusBadgeTone } from '../../constants';
import { useTheme } from '../../hooks';
import { CustomText } from '../custom-text';
import StatusBadgeStyles from './StatusBadgeStyles';
import type { StatusBadgeProps } from './StatusBadgeTypes';

/** Maps a tone to its background/text style keys. */
const TONE_STYLE_KEY = Object.freeze({
  [STATUS_BADGE_TONE.green]: { container: 'badgeGreen', text: 'badgeGreenText' },
  [STATUS_BADGE_TONE.amber]: { container: 'badgeAmber', text: 'badgeAmberText' },
  [STATUS_BADGE_TONE.coral]: { container: 'badgeCoral', text: 'badgeCoralText' }
} as const satisfies Record<StatusBadgeTone, { container: string; text: string }>);

/**
 * Small pill badge (green, amber or coral tone).
 * @param {StatusBadgeProps} props - badge label and tone.
 * @returns {ReactElement} A React Element.
 */
const StatusBadge = ({ label, tone = STATUS_BADGE_TONE.green }: StatusBadgeProps): ReactElement => {
  const { styles } = useTheme(StatusBadgeStyles);
  const toneKey = TONE_STYLE_KEY[tone];

  const containerStyle = useMemo(
    () => StyleSheet.flatten([styles.badge, styles[toneKey.container]]),
    [styles, toneKey]
  );
  const textStyle = useMemo(
    () => StyleSheet.flatten([styles.badgeText, styles[toneKey.text]]),
    [styles, toneKey]
  );

  return (
    <View style={containerStyle}>
      <CustomText style={textStyle}>{label}</CustomText>
    </View>
  );
};

export default StatusBadge;
