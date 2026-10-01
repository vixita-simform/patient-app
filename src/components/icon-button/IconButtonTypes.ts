import type { ReactNode } from "react";

export interface IconButtonProps {
  children: ReactNode;
  onPress?: () => void;
  /** Dims the button and ignores presses. */
  disabled?: boolean;
  accessibilityLabel: string;
}
