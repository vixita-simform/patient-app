import type { ComponentType } from "react";

import type { ColorKey } from "../../../../theme";
import type { RecordSummary } from "../../../../types";

export interface RecordRowProps {
  record: RecordSummary;
  /** Called with the record's id when the row is pressable (lab reports only); omitted otherwise. */
  onPress?: (id: string) => void;
}

/** Per-record-type icon and icon-tint colour, driving the row's icon box. */
export interface RecordTypeMeta {
  Icon: ComponentType<{ size?: number; color?: string }>;
  iconColorKey: ColorKey;
}
