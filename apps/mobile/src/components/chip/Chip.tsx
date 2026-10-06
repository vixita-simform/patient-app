import type { ReactElement } from "react";
import { memo, useCallback, useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";

import { useTheme } from "../../hooks";
import { CustomText } from "../custom-text";
import ChipStyles from "./ChipStyles";
import type { ChipProps } from "./ChipTypes";

/**
 * Single-select pill chip; passes its id back on press.
 * @param {ChipProps<T>} props - id, label, selected flag and press handler.
 * @returns {ReactElement} A React Element.
 */
const Chip = <T extends string>({ id, label, selected, onPress }: ChipProps<T>): ReactElement => {
  const { styles } = useTheme(ChipStyles);
  const handlePress = useCallback(() => onPress(id), [id, onPress]);
  const accessibilityState = useMemo(() => ({ selected }), [selected]);
  const chipStyle = useMemo(
    () => (selected ? StyleSheet.flatten([styles.chip, styles.chipActive]) : styles.chip),
    [styles, selected],
  );
  const textStyle = useMemo(
    () => (selected ? StyleSheet.flatten([styles.chipText, styles.chipTextActive]) : styles.chipText),
    [styles, selected],
  );

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      style={chipStyle}
      onPress={handlePress}
    >
      <CustomText style={textStyle}>{label}</CustomText>
    </Pressable>
  );
};

export default memo(Chip) as typeof Chip;
