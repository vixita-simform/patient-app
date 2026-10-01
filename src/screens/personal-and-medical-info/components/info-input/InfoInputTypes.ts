import type { ReactNode } from "react";

export interface InfoInputProps {
  value: string;
  onChangeText?: (text: string) => void;
  /** When set the field is read-only and the whole row opens a picker on tap. */
  onPress?: () => void;
  accessibilityLabel: string;
  /** Icon rendered at the trailing edge (e.g. calendar). */
  trailingIcon?: ReactNode;
  /** Secondary muted text rendered at the trailing edge (e.g. phone number). */
  trailingText?: string;
}
