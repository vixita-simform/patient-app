import type { ComponentType } from "react";

import type { VisitMode } from "../../../../constants";

export interface VisitTypeCardProps {
  /** Visit mode this card selects, passed back to `onPress`. */
  id: VisitMode;
  Icon: ComponentType<{ size?: number; color?: string }>;
  iconColor: string;
  title: string;
  subtitle: string;
  active: boolean;
  onPress: (id: VisitMode) => void;
}
