import type { ReactElement } from "react";
import { useCallback } from "react";
import { Pressable } from "react-native";

import { AppText } from "../../../../components";
import { useTheme } from "../../../../hooks";
import FilterChipStyles from "./FilterChipStyles";
import type { FilterChipProps } from "./FilterChipTypes";

/**
 * Selectable document-type filter chip.
 * @param {FilterChipProps} props - label, value, active flag and select handler.
 * @returns {ReactElement} A React Element.
 */
const FilterChip = ({ label, value, active, onSelect }: FilterChipProps): ReactElement => {
  const { styles } = useTheme(FilterChipStyles);
  const handlePress = useCallback(() => onSelect(value), [onSelect, value]);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.chip, active && styles.chipActive]}
      onPress={handlePress}>
      <AppText numberOfLines={1} style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </AppText>
    </Pressable>
  );
};

export default FilterChip;
