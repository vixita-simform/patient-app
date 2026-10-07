import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../hooks';
import ProgressBarStyles from './ProgressBarStyles';
import type { ProgressBarProps } from './ProgressBarTypes';

/**
 * Linear progress bar (light track and mint fill, designed for dark surfaces).
 * @param {ProgressBarProps} props - completed fraction 0..1.
 * @returns {ReactElement} A React Element.
 */
const ProgressBar = ({ value }: ProgressBarProps): ReactElement => {
  const { styles } = useTheme(ProgressBarStyles);
  const clamped = Number.isFinite(value) ? Math.min(Math.max(value, 0), 1) : 0;
  const percent = Math.round(clamped * 100);
  // Width is data-driven, so it cannot live in the static stylesheet
  const fillStyle = useMemo(
    () => StyleSheet.flatten([styles.tokenProgressFill, { width: `${clamped * 100}%` as const }]),
    [styles, clamped]
  );
  const accessibilityValue = useMemo(() => ({ min: 0, max: 100, now: percent }), [percent]);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={accessibilityValue}
      style={styles.tokenProgress}
    >
      <View style={fillStyle} />
    </View>
  );
};

export default ProgressBar;
