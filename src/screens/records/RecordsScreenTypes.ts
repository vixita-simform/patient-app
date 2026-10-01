import type { RecordSummaryTileId } from "../../constants";
import type { RecordGroup } from "../../types";
import type { RecordSummaryTileData } from "./components";

export interface UseRecordsScreenReturn {
  summaryTiles: readonly RecordSummaryTileData[];
  groups: readonly RecordGroup[];
  onRecordPress: (id: string) => void;
  onSummaryTilePress: (id: RecordSummaryTileId) => void;
}
