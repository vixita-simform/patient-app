import type { ReactElement } from "react";
import { useCallback } from "react";
import { Pressable } from "react-native";

import { CheckIcon } from "../../../../assets/icons";
import { AppText } from "../../../../components";
import { useTheme } from "../../../../hooks";
import { Colors, scale } from "../../../../theme";
import YearOptionRowStyles from "./YearOptionRowStyles";
import type { YearOptionRowProps } from "./YearOptionRowTypes";

const CHECK_SIZE = scale(16);
const CHECK_STROKE = 3;

/**
 * Selectable year row for the filter-by-year sheet.
 * @param {YearOptionRowProps} props - label, value, active flag and select handler.
 * @returns {ReactElement} A React Element.
 */
const YearOptionRow = ({ label, value, active, onSelect }: YearOptionRowProps): ReactElement => {
  const { styles, theme } = useTheme(YearOptionRowStyles);
  const handlePress = useCallback(() => onSelect(value), [onSelect, value]);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.row, active && styles.rowActive]}
      onPress={handlePress}>
      <AppText style={[styles.label, active && styles.labelActive]}>{label}</AppText>
      {active ? (
        <CheckIcon
          color={Colors[theme].primary}
          size={CHECK_SIZE}
          strokeWidth={CHECK_STROKE}
          testID="year-option-check"
        />
      ) : null}
    </Pressable>
  );
};

export default YearOptionRow;
