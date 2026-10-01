import type { ComponentType } from "react";

import type { ColorKey } from "../../../../theme";
import type { NotificationItem } from "../../../../types";
import type NotificationRowStyles from "./NotificationRowStyles";

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

/** The icon-box tint style keys (`iconBoxGreen`, `iconBoxBlue`, ...), derived from `NotificationRowStyles`. */
export type NotificationIconBoxStyleKey = Exclude<
  Extract<keyof ReturnType<typeof NotificationRowStyles>, `iconBox${string}`>,
  "iconBox"
>;

export interface NotificationTypeMeta {
  Icon: ComponentType<IconProps>;
  /** Icon-box tint style key (see `NotificationRowStyles`). */
  boxStyleKey: NotificationIconBoxStyleKey;
  /** Icon stroke colour token. Medicine uses `amberInk` (see resolved decision: `.ib-amber` has no direct token match). */
  iconColorKey: ColorKey;
}
