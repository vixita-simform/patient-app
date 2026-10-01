import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo } from "react";

import { getLabReportDetail, STATUS_BADGE_TONE } from "../../constants";
import type { LabReportDetail } from "../../types";
import { RANGE_BAND } from "./components";
import type {
  LabResultRowData,
  UseLabReportDetailScreenReturn,
} from "./LabReportDetailScreenTypes";

/**
 * Computes a result's range-bar marker position as a percentage of the
 * marker rail. The normal min/max map onto the green band's start/end
 * (`RANGE_BAND`), so in-range values sit inside the band and out-of-range
 * values fall either side of it; the result is clamped so the marker never
 * renders off the bar.
 * @param {number} value - the measured value.
 * @param {number} min - normal range minimum.
 * @param {number} max - normal range maximum.
 * @returns {number} a percentage in [0, 100].
 */
export const computeMarkerPercent = (value: number, min: number, max: number): number => {
  if (max <= min) {
    return 0;
  }
  const percent = RANGE_BAND.start + ((value - min) / (max - min)) * RANGE_BAND.width;
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
    () => results.some((result) => result.status === STATUS_BADGE_TONE.coral),
    [results],
  );

  const onBackPress = useCallback(() => {
    router.back();
  }, []);

  return {
    report,
    results,
    showAlert,
    onBackPress,
    // Share and Download PDF await a report-document backend; until then no
    // handler is returned and the screen renders both buttons disabled.
    onSharePress: undefined,
    onDownloadPress: undefined,
  };
}
