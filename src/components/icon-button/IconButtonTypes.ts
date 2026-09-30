import type { ReactNode } from "react";

export interface IconButtonProps {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
}
