import type { ComponentType } from "react";

import { ActivityIcon, BedIcon, FlaskIcon, PillIcon } from "../../assets/icons";
import type { ColorKey } from "../../theme";
import { RECORD_TYPE, type RecordType } from "../../constants";
import type { RecordGroup } from "../../types";

interface IconProps {
  size?: number;
  color?: string;
}

/** Per-record-type icon and icon-tint colour, driving the row's icon box. */
interface RecordTypeMeta {
  Icon: ComponentType<IconProps>;
  iconColorKey: ColorKey;
}

/** Maps each `RecordType` to the row icon and its stroke colour (icon-box tint). */
export const RECORD_TYPE_META: Record<RecordType, RecordTypeMeta> = Object.freeze({
  [RECORD_TYPE.labReport]: { Icon: FlaskIcon, iconColorKey: "blue" },
  [RECORD_TYPE.scan]: { Icon: ActivityIcon, iconColorKey: "green" },
  [RECORD_TYPE.prescription]: { Icon: PillIcon, iconColorKey: "amberInk" },
  [RECORD_TYPE.discharge]: { Icon: BedIcon, iconColorKey: "coral" },
});

/** Grouped records already narrowed to the active filter, for the FlatList. */
export type RecordGroupListItem = RecordGroup;
