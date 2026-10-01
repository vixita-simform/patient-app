import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo } from "react";

import { getLabReportDetail } from "../../constants";
import type { LabReportDetail } from "../../types";
import type {
  LabResultRowData,
  UseLabReportDetailScreenReturn,
} from "./LabReportDetailScreenTypes";

/**
 * Computes a result's range-bar marker position as a percentage of the
 * track width, from its value against its own normal min/max, clamped so an
 * out-of-range value never renders the marker off the bar.
 * @param {number} value - the measured value.
 * @param {number} min - normal range minimum.
 * @param {number} max - normal range maximum.
 * @returns {number} a percentage in [0, 100].
 */
const computeMarkerPercent = (value: number, min: number, max: number): number => {
  if (max <= min) {
    return 0;
  }
  const percent = ((value - min) / (max - min)) * 100;
  return Math.min(100, Math.max(0, percent));
};

/**
 * State and handlers for the Lab Report Detail screen.
 * @returns {UseLabReportDetailScreenReturn} the looked-up report, its derived
 * result rows, the alert-banner flag, and the header/footer handlers.
 */
export default function useLabReportDetailScreen(): UseLabReportDetailScreenReturn {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const report = useMemo<LabReportDetail | null>(
    () => (id ? (getLabReportDetail(id) ?? null) : null),
    [id],
  );

  const results = useMemo<readonly LabResultRowData[]>(
    () =>
      (report?.results ?? []).map((result) => ({
        ...result,
        markerPercent: computeMarkerPercent(result.value, result.normalMin, result.normalMax),
      })),
    [report],
  );

  const showAlert = useMemo(
    () => results.some((result) => result.status === "coral"),
    [results],
  );

  const onBackPress = useCallback(() => {
    router.back();
  }, []);

  // No sharing target defined by the design; harmless no-op stub.
  const onSharePress = useCallback(() => {}, []);
  // No document backend defined by the design; harmless no-op stub.
  const onDownloadPress = useCallback(() => {}, []);

  return {
    report,
    results,
    showAlert,
    onBackPress,
    onSharePress,
    onDownloadPress,
  };
}
