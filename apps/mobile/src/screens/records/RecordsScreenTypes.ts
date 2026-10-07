import type { RecordSummaryTileId } from '../../constants';
import type { RecordRowData, RecordSummaryTileData } from './components';

/** One month group with its rows' navigability resolved. */
export interface RecordGroupViewData {
  id: string;
  monthLabel: string;
  records: readonly RecordRowData[];
}

export interface UseRecordsScreenReturn {
  summaryTiles: readonly RecordSummaryTileData[];
  groups: readonly RecordGroupViewData[];
  onRecordPress: (id: string) => void;
  onSummaryTilePress: (id: RecordSummaryTileId) => void;
}
