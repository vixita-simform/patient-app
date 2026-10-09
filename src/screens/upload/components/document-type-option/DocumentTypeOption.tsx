import { useCallback, type ReactElement } from "react";
import { View } from "react-native";

import { ChevronRightIcon } from "../../../../assets/icons";
import { AppText, Card } from "../../../../components";
import { useTheme } from "../../../../hooks";
import { Colors, scale } from "../../../../theme";
import DocumentTypeOptionStyles from "./DocumentTypeOptionStyles";
import type { DocumentTypeOptionProps } from "./DocumentTypeOptionTypes";

const OPTION_ICON_SIZE = scale(12);

/**
 * One selectable document category row in the type picker.
 * @param {DocumentTypeOptionProps} props - type, selection state and select handler.
 * @returns {ReactElement} A React Element.
 */
const DocumentTypeOption = ({
  type,
  selected,
  onSelect,
}: DocumentTypeOptionProps): ReactElement => {
  const { styles, theme } = useTheme(DocumentTypeOptionStyles);
  const handlePress = useCallback(() => onSelect(type), [onSelect, type]);

  return (
    <Card
      accessibilityLabel={type}
      accessibilityState={{ selected }}
      style={selected ? styles.optionSelected : styles.option}
      onPress={handlePress}
    >
      <View style={styles.optionRow}>
        <AppText style={styles.optionText}>{type}</AppText>
        <ChevronRightIcon
          color={Colors[theme].textSecondary}
          size={OPTION_ICON_SIZE}
        />
      </View>
    </Card>
  );
};

export default DocumentTypeOption;
