import type { ReactElement } from "react";
import { useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";

import { CustomText } from "../../../../components";
import { TIME_SLOT_STATUS } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import TimeSlotChipStyles from "./TimeSlotChipStyles";
import type { TimeSlotChipProps } from "./TimeSlotChipTypes";

/**
 * One cell in the 3-column time-slot grid, with available / selected / taken / past states.
 * @param {TimeSlotChipProps} props - slot id, label, status and press handler.
 * @returns {ReactElement} A React Element.
 */
const TimeSlotChip = ({ id, label, status, onPress }: TimeSlotChipProps): ReactElement => {
  const { styles } = useTheme(TimeSlotChipStyles);
  const taken = status === TIME_SLOT_STATUS.taken;
  const past = status === TIME_SLOT_STATUS.past;
  const active = status === TIME_SLOT_STATUS.selected;
  const disabled = taken || past;
  const handlePress = () => onPress(id);

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
  const accessibilityState = useMemo(() => ({ selected: active, disabled }), [active, disabled]);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      disabled={disabled}
      style={containerStyle}
      onPress={handlePress}
    >
      <CustomText style={labelStyle}>{label}</CustomText>
    </Pressable>
  );
};

export default TimeSlotChip;
