import { ActivityIcon, BedIcon, FlaskIcon, PillIcon } from "../../../../assets/icons";
import { RECORD_TYPE, type RecordType } from "../../../../constants";
import type { RecordTypeMeta } from "./RecordRowTypes";

/** Maps each `RecordType` to the row icon and its stroke colour (icon-box tint). */
export const RECORD_TYPE_META: Record<RecordType, RecordTypeMeta> = Object.freeze({
  [RECORD_TYPE.labReport]: { Icon: FlaskIcon, iconColorKey: "blue" },
  [RECORD_TYPE.scan]: { Icon: ActivityIcon, iconColorKey: "green" },
  [RECORD_TYPE.prescription]: { Icon: PillIcon, iconColorKey: "amberInk" },
  [RECORD_TYPE.discharge]: { Icon: BedIcon, iconColorKey: "coral" },
});

/** Maps a record type to its icon-box tint style key. */
export const ICON_BOX_STYLE_KEY = Object.freeze({
  [RECORD_TYPE.labReport]: "iconBoxBlue",
  [RECORD_TYPE.scan]: "iconBoxGreen",
  [RECORD_TYPE.prescription]: "iconBoxAmber",
  [RECORD_TYPE.discharge]: "iconBoxCoral",
} as const);
