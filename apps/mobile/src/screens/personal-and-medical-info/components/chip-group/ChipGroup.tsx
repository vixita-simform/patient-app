import type { ReactElement } from "react";
import { View } from "react-native";

import { Chip } from "../../../../components";
import { useTheme } from "../../../../hooks";
import ChipGroupStyles from "./ChipGroupStyles";
import type { ChipGroupProps } from "./ChipGroupTypes";

/**
 * Wrapping row of single-select pill chips, typed by the option id union.
 * @param {ChipGroupProps<T>} props - options, selected id and select handler.
 * @returns {ReactElement} A React Element.
 */
const ChipGroup = <T extends string>({ options, selectedId, onSelect }: ChipGroupProps<T>): ReactElement => {
  const { styles } = useTheme(ChipGroupStyles);

  return (
    <View style={styles.chipsWrap}>
      {options.map((option) => (
        <Chip
          id={option.id}
          key={option.id}
          label={option.label}
          selected={option.id === selectedId}
          onPress={onSelect}
        />
      ))}
    </View>
  );
};

export default ChipGroup;
