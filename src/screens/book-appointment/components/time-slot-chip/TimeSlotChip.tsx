import type { ReactElement } from "react";
import { useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";

import { CustomText } from "../../../../components";
import { useTheme } from "../../../../hooks";
import TimeSlotChipStyles from "./TimeSlotChipStyles";
import type { TimeSlotChipProps } from "./TimeSlotChipTypes";

/**
 * One cell in the 3-column time-slot grid, with available / selected / taken states.
 * @param {TimeSlotChipProps} props - label, status and press handler.
 * @returns {ReactElement} A React Element.
 */
const TimeSlotChip = ({ label, status, onPress }: TimeSlotChipProps): ReactElement => {
  const { styles } = useTheme(TimeSlotChipStyles);
  const taken = status === "taken";
  const past = status === "past";
  const active = status === "selected";
  const disabled = taken || past;

  const containerStyle = useMemo(
    () =>
      StyleSheet.flatten([
        styles.slot,
        active && styles.slotActive,
        taken && styles.slotTaken,
        past && styles.slotPast,
      ]),
    [styles, active, taken, past],
  );
  const labelStyle = useMemo(
    () =>
      StyleSheet.flatten([
        styles.slotLabel,
        active && styles.slotActiveLabel,
        taken && styles.slotTakenLabel,
        past && styles.slotPastLabel,
      ]),
    [styles, active, taken, past],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      style={containerStyle}
      onPress={onPress}
    >
      <CustomText style={labelStyle}>{label}</CustomText>
    </Pressable>
  );
};

export default TimeSlotChip;
