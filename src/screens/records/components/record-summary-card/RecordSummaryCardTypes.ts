import type { RecordSummaryTileId } from "../../../../constants";

/** One stat tile in the summary strip: a count plus its label. */
export interface RecordSummaryTileData {
  id: RecordSummaryTileId;
  value: number;
  label: string;
}

export interface RecordSummaryCardProps {
  tiles: readonly RecordSummaryTileData[];
  /** Called with a tile's id when it is tapped. Only tiles with a navigable target become pressable. */
  onTilePress?: (id: string) => void;
}
