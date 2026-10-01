import type { RecordSummary } from "../../../../types";

export interface RecordGroupCardProps {
  records: readonly RecordSummary[];
  /** Called with the record's id when a lab-report row is pressed. */
  onRecordPress?: (id: string) => void;
}
