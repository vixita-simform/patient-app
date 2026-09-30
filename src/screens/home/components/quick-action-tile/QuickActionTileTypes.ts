import type { ComponentType } from "react";

export type QuickActionVariant = "green" | "blue" | "amber" | "emergency";

export interface QuickActionTileProps {
  label: string;
  variant: QuickActionVariant;
  Icon: ComponentType<{ size?: number; color?: string }>;
  onPress?: () => void;
}
