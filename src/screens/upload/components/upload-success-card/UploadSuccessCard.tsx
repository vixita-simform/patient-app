import type { ReactElement } from "react";
import { Pressable, View } from "react-native";

import { CheckIcon } from "../../../../assets/icons";
import { AppText, Card } from "../../../../components";
import { Strings } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import { Colors, scale } from "../../../../theme";
import UploadSuccessCardStyles from "./UploadSuccessCardStyles";
import type { UploadSuccessCardProps } from "./UploadSuccessCardTypes";

const CHECK_ICON_SIZE = scale(22);
const CHECK_STROKE = 3;

/**
 * Confirmation card shown after a document upload completes.
 * @param {UploadSuccessCardProps} props - recipient labels and reset handler.
 * @returns {ReactElement} A React Element.
 */
const UploadSuccessCard = ({
  recipientLabels,
  onReset,
}: UploadSuccessCardProps): ReactElement => {
  const { styles, theme } = useTheme(UploadSuccessCardStyles);
  const strings = Strings.UploadScreen;

  return (
    <Card style={styles.card}>
      <View style={styles.iconCircle}>
        <CheckIcon
          color={Colors[theme].primary}
          size={CHECK_ICON_SIZE}
          strokeWidth={CHECK_STROKE}
        />
      </View>
      <AppText style={styles.title}>{strings.documentUploaded}</AppText>
      <AppText style={styles.subtitle}>{strings.confirmCategory}</AppText>
      <AppText
        style={styles.sentTo}
      >{`${strings.sentTo}${recipientLabels}`}</AppText>
      <Pressable
        accessibilityLabel={strings.uploadAnother}
        accessibilityRole="button"
        style={styles.button}
        onPress={onReset}
      >
        <AppText style={styles.buttonText}>{strings.uploadAnother}</AppText>
      </Pressable>
    </Card>
  );
};

export default UploadSuccessCard;
