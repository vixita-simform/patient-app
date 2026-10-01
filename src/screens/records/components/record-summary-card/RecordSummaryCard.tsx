import type { ReactElement } from "react";
import { Pressable, View } from "react-native";

import { CustomText } from "../../../../components";
import { useTheme } from "../../../../hooks";
import RecordSummaryCardStyles from "./RecordSummaryCardStyles";
import type { RecordSummaryCardProps, RecordSummaryTileData } from "./RecordSummaryCardTypes";

/**
 * Green summary strip: 3 stat tiles (count + label), e.g. "24 Lab reports".
 * Tiles flagged `pressable` (set by the screen hook) become buttons; the rest
 * stay display-only.
 * @param {RecordSummaryCardProps} props - the tiles to render and an optional tile-press handler.
 * @returns {ReactElement} A React Element.
 */
const RecordSummaryCard = ({ tiles, onTilePress }: RecordSummaryCardProps): ReactElement => {
  const { styles } = useTheme(RecordSummaryCardStyles);

  const renderTile = (tile: RecordSummaryTileData) => (
    <>
      <CustomText style={styles.tileValue}>{tile.value}</CustomText>
      <CustomText style={styles.tileLabel}>{tile.label}</CustomText>
    </>
  );

  return (
    <View style={styles.summary}>
      {tiles.map((tile) => {
        if (tile.pressable && onTilePress) {
          return (
            <Pressable
              accessibilityLabel={tile.label}
              accessibilityRole="button"
              key={tile.id}
              style={styles.tile}
              onPress={() => onTilePress(tile.id)}
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
