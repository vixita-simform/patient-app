import type { ReactNode } from "react";
import type { AccessibilityState, StyleProp, ViewStyle } from "react-native";

export interface CardProps {
  children: ReactNode;
  /** Merged after the base card style. */
  style?: StyleProp<ViewStyle>;
  /** Renders a Pressable when provided, otherwise a View. */
  onPress?: () => void;
  /** Screen-reader label; set it whenever `onPress` is given. */
  accessibilityLabel?: string;
  accessibilityState?: AccessibilityState;
}
