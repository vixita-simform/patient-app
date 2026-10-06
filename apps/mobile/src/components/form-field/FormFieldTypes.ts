import type { ReactNode } from "react";

export interface FormFieldProps {
  label: string;
  children: ReactNode;
  /** Validation message shown under the control. */
  error?: string;
}
