import type { ReactElement } from "react";
import { useCallback } from "react";
import { Pressable, View } from "react-native";

import { CustomText } from "../../../../components";
import { RECORD_SUMMARY_TILE_ID } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import RecordSummaryCardStyles from "./RecordSummaryCardStyles";
import type { RecordSummaryCardProps, RecordSummaryTileData } from "./RecordSummaryCardTypes";

/**
 * Green summary strip: 3 stat tiles (count + label), e.g. "24 Lab reports".
 * Only the Prescriptions tile is pressable (routes to Medicines); the other
 * two stay display-only, per the design.
 * @param {RecordSummaryCardProps} props - the tiles to render and an optional tile-press handler.
 * @returns {ReactElement} A React Element.
 */
const RecordSummaryCard = ({ tiles, onTilePress }: RecordSummaryCardProps): ReactElement => {
  const { styles } = useTheme(RecordSummaryCardStyles);

  const handlePress = useCallback(
    (id: string) => {
      onTilePress?.(id);
    },
    [onTilePress],
  );

  const renderTile = useCallback(
    (tile: RecordSummaryTileData) => (
      <>
        <CustomText style={styles.tileValue}>{tile.value}</CustomText>
        <CustomText style={styles.tileLabel}>{tile.label}</CustomText>
      </>
    ),
    [styles.tileValue, styles.tileLabel],
  );

  return (
    <View style={styles.summary}>
      {tiles.map((tile) => {
        const isPressable = Boolean(onTilePress) && tile.id === RECORD_SUMMARY_TILE_ID.prescriptions;

        if (isPressable) {
          return (
            <Pressable
              accessibilityRole="button"
              key={tile.id}
              style={styles.tile}
              onPress={() => handlePress(tile.id)}
            >
              {renderTile(tile)}
            </Pressable>
          );
        }

        return (
          <View key={tile.id} style={styles.tile}>
            {renderTile(tile)}
          </View>
        );
      })}
    </View>
  );
};

export default RecordSummaryCard;
