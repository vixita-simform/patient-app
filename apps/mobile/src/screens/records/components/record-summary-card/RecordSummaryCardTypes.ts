import type { RecordSummaryTileId } from "../../../../constants";

/** One stat tile in the summary strip: a count plus its label. */
export interface RecordSummaryTileData {
  id: RecordSummaryTileId;
  value: number;
  label: string;
  /** Whether tapping the tile navigates somewhere; set by the screen hook. */
  pressable: boolean;
}

export interface RecordSummaryCardProps {
  tiles: readonly RecordSummaryTileData[];
  /** Called with a tile's id when a `pressable` tile is tapped. */
  onTilePress?: (id: RecordSummaryTileId) => void;
}
