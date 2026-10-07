import type { ReactElement } from 'react';
import { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { CustomText } from '../../../../components';
import { useTheme } from '../../../../hooks';
import DateChipStyles from './DateChipStyles';
import type { DateChipProps } from './DateChipTypes';

/**
 * One day cell in the horizontal date strip: weekday label over the day number.
 * @param {DateChipProps} props - day id, weekday/day number, selection state and press handler.
 * @returns {ReactElement} A React Element.
 */
const DateChip = ({
  id,
  weekday,
  dayNumber,
  accessibilityLabel,
  active,
  disabled,
  onPress
}: DateChipProps): ReactElement => {
  const { styles } = useTheme(DateChipStyles);
  const handlePress = useCallback(() => onPress(id), [id, onPress]);

  const containerStyle = useMemo(
    () =>
      StyleSheet.flatten([styles.date, active && styles.dateActive, disabled && styles.dateOff]),
    [styles, active, disabled]
  );
  const dayStyle = useMemo(
    () => StyleSheet.flatten([styles.dateDay, active && styles.dateActiveDay]),
    [styles, active]
  );
  const numStyle = useMemo(
    () => StyleSheet.flatten([styles.dateNum, active && styles.dateActiveNum]),
    [styles, active]
  );
  const accessibilityState = useMemo(() => ({ selected: active, disabled }), [active, disabled]);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      disabled={disabled}
      style={containerStyle}
      onPress={handlePress}
    >
      <CustomText style={dayStyle}>{weekday}</CustomText>
      <CustomText style={numStyle}>{dayNumber}</CustomText>
    </Pressable>
  );
};

export default DateChip;
