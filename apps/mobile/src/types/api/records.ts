import type { RECORD_TRAILING_KIND, RecordType, StatusBadgeTone } from "../../constants";

/** Record row trailing slot: a status pill, or a plain chevron (no status). */
export type RecordTrailing =
  | { kind: typeof RECORD_TRAILING_KIND.badge; label: string; tone: StatusBadgeTone }
  | { kind: typeof RECORD_TRAILING_KIND.chevron };

/** One record row as rendered inside a month-grouped card. */
export interface RecordSummary {
  id: string;
  type: RecordType;
  title: string;
  subtitle: string;
  trailing: RecordTrailing;
  /** Lab-report rows navigate to their detail by default; set false to opt a row out. */
  pressable?: boolean;
}

/** One month-labeled group of records, newest first. */
export interface RecordGroup {
  id: string;
  monthLabel: string;
  records: readonly RecordSummary[];
}

/** The green summary strip's 3 stat tiles. */
export interface RecordSummaryStats {
  labReportsCount: number;
  prescriptionsCount: number;
  dischargesCount: number;
}

/** API response shape for Medical Records (GET /patients/me/records). */
export interface RecordListResponse {
  stats: RecordSummaryStats;
  groups: readonly RecordGroup[];
}

/** One measured value in a lab report, with its normal reference range. */
export interface LabResultDetail {
  id: string;
  name: string;
  value: number;
  unit: string;
  normalMin: number;
  normalMax: number;
  status: StatusBadgeTone;
  statusLabel: string;
}

/** Full detail for a single lab report (e.g. "Complete blood count"). */
export interface LabReportDetail {
  id: string;
  /** Test name shown as the screen title, e.g. "Complete blood count". */
  title: string;
  /** ISO 8601 date-time */
  sampleCollectedAt: string;
  orderedByDoctorName: string;
  reportId: string;
  results: readonly LabResultDetail[];
  /** Alert-card message shown when a result is out of range; empty when none apply. */
  alertMessage: string;
}
