import type { ReactElement } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { CustomText } from "../../../../components";
import { useTheme } from "../../../../hooks";
import ChipGroupStyles from "./ChipGroupStyles";
import type { ChipGroupProps } from "./ChipGroupTypes";

/**
 * Wrapping row of single-select pill chips.
 * @param {ChipGroupProps} props - options, selected id and select handler.
 * @returns {ReactElement} A React Element.
 */
const ChipGroup = ({ options, selectedId, onSelect }: ChipGroupProps): ReactElement => {
  const { styles } = useTheme(ChipGroupStyles);

  return (
    <View style={styles.chipsWrap}>
      {options.map((option) => {
        const active = option.id === selectedId;
        return (
          <Pressable
            accessibilityLabel={option.label}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            key={option.id}
            style={StyleSheet.flatten([styles.chip, active && styles.chipActive])}
            onPress={() => onSelect(option.id)}
          >
            <CustomText style={StyleSheet.flatten([styles.chipText, active && styles.chipTextActive])}>
              {option.label}
            </CustomText>
          </Pressable>
        );
      })}
    </View>
  );
};

export default ChipGroup;
