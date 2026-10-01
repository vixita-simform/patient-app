import { router } from "expo-router";
import { useCallback, useMemo } from "react";

import { RECORD_SUMMARY_TILE_ID, STACK_ROUTES, Strings, recordsDummyData } from "../../constants";
import type { RecordSummaryTileData } from "./components";
import type { RecordGroupListItem } from "./RecordsScreenTypes";

interface UseRecordsScreenReturn {
  summaryTiles: readonly RecordSummaryTileData[];
  groups: readonly RecordGroupListItem[];
  onRecordPress: (id: string) => void;
  onSummaryTilePress: (id: string) => void;
}

/**
 * Medical Records screen state: static dummy data (no pagination/API) —
 * summary tiles and month-grouped records, as shown in the design.
 * @returns {UseRecordsScreenReturn} summary tiles and the record groups.
 */
const useRecordsScreen = (): UseRecordsScreenReturn => {
  const onRecordPress = useCallback((id: string) => {
    router.push({ pathname: STACK_ROUTES.labReportDetail, params: { id } });
  }, []);

  // Only the Prescriptions tile currently has a target screen (Medicines).
  const onSummaryTilePress = useCallback((id: string) => {
    if (id === RECORD_SUMMARY_TILE_ID.prescriptions) {
      router.push(STACK_ROUTES.medicines);
    }
  }, []);

  const summaryTiles = useMemo<readonly RecordSummaryTileData[]>(
    () => [
      {
        id: RECORD_SUMMARY_TILE_ID.labReports,
        value: recordsDummyData.stats.labReportsCount,
        label: Strings.RecordsScreen.labReports,
      },
      {
        id: RECORD_SUMMARY_TILE_ID.prescriptions,
        value: recordsDummyData.stats.prescriptionsCount,
        label: Strings.RecordsScreen.prescriptions,
      },
      {
        id: RECORD_SUMMARY_TILE_ID.discharges,
        value: recordsDummyData.stats.dischargesCount,
        label: Strings.RecordsScreen.discharges,
      },
    ],
    [],
  );

  return {
    summaryTiles,
    groups: recordsDummyData.groups,
    onRecordPress,
    onSummaryTilePress,
  };
};

export default useRecordsScreen;
