import type { ReactElement } from "react";
import { useCallback } from "react";
import { Pressable, View } from "react-native";

import { DownloadIcon } from "../../../../assets/icons";
import { AppText, Card } from "../../../../components";
import { Strings } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import { Colors, scale } from "../../../../theme";
import { fillTemplate } from "../../../../utils";
import DocumentCardStyles from "./DocumentCardStyles";
import type { DocumentCardProps } from "./DocumentCardTypes";

const DOWNLOAD_ICON_SIZE = scale(10);

/**
 * Document list card with name, type, year and file info, plus a download
 * button that renders only when an `onDownload` handler is provided.
 * @param {DocumentCardProps} props - document and optional download handler.
 * @returns {ReactElement} A React Element.
 */
const DocumentCard = ({ document, onDownload }: DocumentCardProps): ReactElement => {
  const { styles, theme } = useTheme(DocumentCardStyles);
  const separator = Strings.Common.metaSeparator;
  const handleDownload = useCallback(() => onDownload?.(document), [onDownload, document]);

  return (
    <Card style={styles.card}>
      <View style={styles.info}>
        <AppText style={styles.name}>{document.name}</AppText>
        <AppText style={styles.meta}>{`${document.type}${separator}${document.year}`}</AppText>
      </View>
      <View style={styles.footer}>
        <AppText style={styles.fileInfo}>{`${document.date}${separator}${document.size}`}</AppText>
        {onDownload ? (
          <Pressable
            accessibilityLabel={fillTemplate(Strings.DocumentsScreen.downloadDocument, {
              name: document.name,
            })}
            accessibilityRole="button"
            style={styles.downloadButton}
            onPress={handleDownload}>
            <DownloadIcon color={Colors[theme].primary} size={DOWNLOAD_ICON_SIZE} />
            <AppText style={styles.downloadText}>{Strings.DocumentsScreen.download}</AppText>
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
};

export default DocumentCard;
