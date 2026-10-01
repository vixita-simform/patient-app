import type { ComponentType, ReactElement } from "react";

export interface VisitTypeCardProps {
  Icon: ComponentType<{ size?: number; color?: string }>;
  iconColor: string;
  title: string;
  subtitle: string;
  active: boolean;
  onPress: () => void;
}

export type VisitTypeCardElement = ReactElement;
