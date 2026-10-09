import type { ReactElement } from "react";
import { StyleSheet, View } from "react-native";

import { AppText, Card } from "../../../../components";
import { useTheme } from "../../../../hooks";
import UploadSourceTileStyles from "./UploadSourceTileStyles";
import type { UploadSourceTileProps } from "./UploadSourceTileTypes";

/**
 * Dashed tile with a tinted icon box, used to pick a capture source.
 * @param {UploadSourceTileProps} props - label, tone, icon and press handler.
 * @returns {ReactElement} A React Element.
 */
const UploadSourceTile = ({
  label,
  tone,
  icon,
  onPress,
}: UploadSourceTileProps): ReactElement => {
  const { styles } = useTheme(UploadSourceTileStyles);

  return (
    <Card accessibilityLabel={label} style={styles.tile} onPress={onPress}>
      <View
        style={StyleSheet.flatten([
          styles.iconBox,
          tone === "green" ? styles.iconBoxGreen : styles.iconBoxTeal,
        ])}
      >
        {icon}
      </View>
      <AppText style={styles.label}>{label}</AppText>
    </Card>
  );
};

export default UploadSourceTile;
