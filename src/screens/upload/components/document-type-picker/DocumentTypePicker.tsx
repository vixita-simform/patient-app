import type { ReactElement } from "react";
import { Pressable, View } from "react-native";

import { BackIcon } from "../../../../assets/icons";
import { AppText } from "../../../../components";
import { Strings } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import { Colors, scale } from "../../../../theme";
import DocumentTypeOption from "../document-type-option/DocumentTypeOption";
import DocumentTypePickerStyles from "./DocumentTypePickerStyles";
import type { DocumentTypePickerProps } from "./DocumentTypePickerTypes";

const BACK_ICON_SIZE = scale(18);
const HIT_SLOP = scale(8);

/**
 * Full-content list of document categories with a back header.
 * @param {DocumentTypePickerProps} props - types, selection and handlers.
 * @returns {ReactElement} A React Element.
 */
const DocumentTypePicker = ({
  types,
  selectedType,
  onSelect,
  onBack,
}: DocumentTypePickerProps): ReactElement => {
  const { styles, theme } = useTheme(DocumentTypePickerStyles);

  return (
    <>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel={Strings.Common.back}
          accessibilityRole="button"
          hitSlop={HIT_SLOP}
          style={styles.backButton}
          onPress={onBack}
        >
          <BackIcon color={Colors[theme].text} size={BACK_ICON_SIZE} />
        </Pressable>
        <View>
          <AppText style={styles.title}>
            {Strings.UploadScreen.selectDocumentType}
          </AppText>
          <AppText style={styles.subtitle}>
            {Strings.UploadScreen.categoriesConfirmed}
          </AppText>
        </View>
      </View>
      {types.map((type) => (
        <DocumentTypeOption
          key={type}
          selected={type === selectedType}
          type={type}
          onSelect={onSelect}
        />
      ))}
    </>
  );
};

export default DocumentTypePicker;
