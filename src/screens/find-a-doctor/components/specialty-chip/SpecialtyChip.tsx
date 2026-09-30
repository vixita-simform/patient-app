import { type ReactElement, useCallback } from "react";
import { Pressable } from "react-native";

import { CustomText } from "../../../../components";
import { useTheme } from "../../../../hooks";
import SpecialtyChipStyles from "./SpecialtyChipStyles";
import type { SpecialtyChipProps } from "./SpecialtyChipTypes";

/**
 * Single-select specialty filter chip.
 * @param {SpecialtyChipProps} props - id, label, active flag and press handler.
 * @returns {ReactElement} A React Element.
 */
const SpecialtyChip = ({
  id,
  label,
  active,
  onPress,
}: SpecialtyChipProps): ReactElement => {
  const { styles } = useTheme(SpecialtyChipStyles);
  const handlePress = useCallback(() => onPress(id), [id, onPress]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.chip, active && styles.chipActive]}
      onPress={handlePress}
    >
      <CustomText style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </CustomText>
    </Pressable>
  );
};

export default SpecialtyChip;
