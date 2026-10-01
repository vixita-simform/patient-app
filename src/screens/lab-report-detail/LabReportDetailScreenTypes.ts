import type { LabReportDetail, LabResultDetail } from "../../types";

/** One result row plus its derived range-bar geometry. */
export interface LabResultRowData extends LabResultDetail {
  /** Marker centre, clamped to [0, 100], as a percentage of the range-bar marker rail. */
  markerPercent: number;
}

export interface UseLabReportDetailScreenReturn {
  /** The looked-up report, or null when the id is unknown. */
  report: LabReportDetail | null;
  /** Results with their computed range-bar marker position. */
  results: readonly LabResultRowData[];
  /** True when at least one result is out of range (coral tone). */
  showAlert: boolean;
  onBackPress: () => void;
  /** Undefined until a share target exists; the header share button renders disabled. */
  onSharePress?: () => void;
  /** Undefined until a report-document backend exists; "Download PDF" renders disabled. */
  onDownloadPress?: () => void;
}
