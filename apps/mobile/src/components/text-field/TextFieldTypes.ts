import type { ReactNode } from 'react';
import type { KeyboardTypeOptions, TextInputProps } from 'react-native';

export interface TextFieldProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  /** When set the field is read-only and the whole row opens something (e.g. a picker) on tap. */
  onPress?: () => void;
  /** Defaults to `label`. */
  accessibilityLabel?: string;
  placeholder?: string;
  maxLength?: number;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  /** Autofill hint, e.g. "current-password". */
  autoComplete?: TextInputProps['autoComplete'];
  /** Masks the input (passwords). */
  secureTextEntry?: boolean;
  /** Validation message; also switches the field to its error border. */
  error?: string;
  /** Rendered before the input inside the border (e.g. a country-code picker). */
  leading?: ReactNode;
  /** Icon rendered at the trailing edge (e.g. calendar). */
  trailingIcon?: ReactNode;
  /** Secondary muted text rendered at the trailing edge (e.g. a phone number). */
  trailingText?: string;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
}
