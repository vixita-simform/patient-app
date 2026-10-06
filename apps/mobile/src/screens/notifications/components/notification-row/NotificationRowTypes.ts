import type { ComponentType } from "react";

import type { IconTone } from "../../../../constants";
import type { NotificationItem } from "../../../../types";

/** A `NotificationItem` plus its pre-formatted relative/absolute time label for display. */
export interface NotificationRowData extends NotificationItem {
  timeLabel: string;
}

export interface NotificationRowProps {
  notification: NotificationRowData;
  /** Called with the notification's id when the row is pressed (marks it read). */
  onPress?: (id: string) => void;
}

interface IconProps {
  size?: number;
  color?: string;
}

export interface NotificationTypeMeta {
  Icon: ComponentType<IconProps>;
  /** Icon-box tone; amber renders its icon in `amberInk` (`.ib-amber` has no direct token match). */
  tone: IconTone;
}
