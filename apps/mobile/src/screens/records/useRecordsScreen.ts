import { router } from "expo-router";
import { useCallback, useMemo } from "react";

import {
  RECORD_SUMMARY_TILE_ID,
  RECORD_TYPE,
  recordsDummyData,
  STACK_ROUTES,
  Strings,
} from "../../constants";
import type { RecordSummaryTileId } from "../../constants";
import type { RecordSummaryTileData } from "./components";
import type { RecordGroupViewData, UseRecordsScreenReturn } from "./RecordsScreenTypes";

/**
 * Month groups with each row's navigability decided once: only lab reports have a detail
 * screen today, and a record can opt out with `pressable: false`.
 */
const RECORD_GROUPS: readonly RecordGroupViewData[] = Object.freeze(
  recordsDummyData.groups.map((group) => ({
    id: group.id,
    monthLabel: group.monthLabel,
    records: group.records.map((record) => ({
      ...record,
      pressable: record.type === RECORD_TYPE.labReport && record.pressable !== false,
    })),
  })),
);

/**
 * Medical Records screen state: static dummy data (no pagination/API) —
 * summary tiles and month-grouped records, as shown in the design.
 * @returns {UseRecordsScreenReturn} summary tiles and the record groups.
 */
const useRecordsScreen = (): UseRecordsScreenReturn => {
  const onRecordPress = useCallback((id: string) => {
    router.push({ pathname: STACK_ROUTES.labReportDetail, params: { id } });
  }, []);

  // Only the Prescriptions tile currently has a target screen (Medicines); it is the
  // only tile flagged `pressable` below.
  const onSummaryTilePress = useCallback((id: RecordSummaryTileId) => {
    if (id === RECORD_SUMMARY_TILE_ID.prescriptions) {
      router.push(STACK_ROUTES.medicines);
    }
  }, []);

  const summaryTiles = useMemo<readonly RecordSummaryTileData[]>(
    () => [
      {
        id: RECORD_SUMMARY_TILE_ID.labReports,
        value: recordsDummyData.stats.labReportsCount,
        label: Strings.Common.labReports,
        pressable: false,
      },
      {
        id: RECORD_SUMMARY_TILE_ID.prescriptions,
        value: recordsDummyData.stats.prescriptionsCount,
        label: Strings.RecordsScreen.prescriptions,
        pressable: true,
      },
      {
        id: RECORD_SUMMARY_TILE_ID.discharges,
        value: recordsDummyData.stats.dischargesCount,
        label: Strings.RecordsScreen.discharges,
        pressable: false,
      },
    ],
    [],
  );

  return {
    summaryTiles,
    groups: RECORD_GROUPS,
    onRecordPress,
    onSummaryTilePress,
  };
};

export default useRecordsScreen;
