import { useCallback, type ReactElement } from "react";
import { Pressable, View } from "react-native";

import { UploadIcon } from "../../../../assets/icons";
import { AppText, Card } from "../../../../components";
import { Strings } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import { Colors, scale } from "../../../../theme";
import { fillTemplate } from "../../../../utils";
import UploadedDocCardStyles from "./UploadedDocCardStyles";
import type { UploadedDocCardProps } from "./UploadedDocCardTypes";

const UPLOAD_ICON_SIZE = scale(10);

/**
 * Previously uploaded document, with a Replace action when `onReplace` is given.
 * @param {UploadedDocCardProps} props - document and optional replace handler.
 * @returns {ReactElement} A React Element.
 */
const UploadedDocCard = ({
  doc,
  onReplace,
}: UploadedDocCardProps): ReactElement => {
  const { styles, theme } = useTheme(UploadedDocCardStyles);
  const handleReplace = useCallback(() => onReplace?.(doc.id), [doc.id, onReplace]);

  return (
    <Card style={styles.card}>
      <View style={onReplace ? styles.info : styles.infoOnly}>
        <AppText numberOfLines={1} style={styles.name}>
          {doc.name}
        </AppText>
        <AppText style={styles.meta}>
          {`${doc.type}${Strings.Common.metaSeparator}${doc.date}`}
        </AppText>
      </View>
      {onReplace ? (
        <Pressable
          accessibilityLabel={fillTemplate(Strings.UploadScreen.replaceDocument, {
            name: doc.name,
          })}
          accessibilityRole="button"
          style={styles.replaceButton}
          onPress={handleReplace}
        >
          <UploadIcon color={Colors[theme].primary} size={UPLOAD_ICON_SIZE} />
          <AppText style={styles.replaceText}>
            {Strings.UploadScreen.replace}
          </AppText>
        </Pressable>
      ) : null}
    </Card>
  );
};

export default UploadedDocCard;
