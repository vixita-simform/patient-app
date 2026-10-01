import type { RecordSummary } from "../../../../types";

export interface RecordRowProps {
  record: RecordSummary;
  /** Called with the record's id when the row is pressable (lab reports only); omitted otherwise. */
  onPress?: (id: string) => void;
}
