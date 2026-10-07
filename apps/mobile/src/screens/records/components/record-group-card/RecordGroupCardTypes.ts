import type { RecordRowData } from '../record-row';

export interface RecordGroupCardProps {
  records: readonly RecordRowData[];
  /** Called with the record's id when a pressable row is pressed. */
  onRecordPress?: (id: string) => void;
}
