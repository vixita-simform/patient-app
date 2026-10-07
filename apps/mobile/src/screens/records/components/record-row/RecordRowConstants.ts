import { ActivityIcon, BedIcon, FlaskIcon, PillIcon } from '../../../../assets/icons';
import { ICON_TONE, RECORD_TYPE, type RecordType } from '../../../../constants';
import type { RecordTypeMeta } from './RecordRowTypes';

/** Maps each `RecordType` to the row icon and its icon-box tone. */
export const RECORD_TYPE_META: Record<RecordType, RecordTypeMeta> = Object.freeze({
  [RECORD_TYPE.labReport]: { Icon: FlaskIcon, tone: ICON_TONE.blue },
  [RECORD_TYPE.scan]: { Icon: ActivityIcon, tone: ICON_TONE.green },
  [RECORD_TYPE.prescription]: { Icon: PillIcon, tone: ICON_TONE.amber },
  [RECORD_TYPE.discharge]: { Icon: BedIcon, tone: ICON_TONE.coral }
});
