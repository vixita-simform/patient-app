import type { ComponentType } from "react";

import type { IconTone } from "../../../../constants";
import type { RecordSummary } from "../../../../types";

/** A record row with its navigability already decided by the screen hook. */
export interface RecordRowData extends RecordSummary {
  /** True when the row opens a detail screen (it then renders as a button with a chevron). */
  pressable: boolean;
}

export interface RecordRowProps {
  record: RecordRowData;
  /** Called with the record's id when a pressable row is pressed. */
  onPress?: (id: string) => void;
}

/** Per-record-type icon and icon-box tone. */
export interface RecordTypeMeta {
  Icon: ComponentType<{ size?: number; color?: string }>;
  tone: IconTone;
}
