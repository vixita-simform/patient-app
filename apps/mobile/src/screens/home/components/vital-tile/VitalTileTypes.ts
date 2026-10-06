import type { ComponentType } from "react";

export type VitalTone = "coral" | "blue" | "amber";

export interface VitalTileProps {
  Icon: ComponentType<{ size?: number; color?: string }>;
  tone: VitalTone;
  value: string;
  unit?: string;
  label: string;
}
