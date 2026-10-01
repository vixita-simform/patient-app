import type { KeyboardTypeOptions, TextInputProps } from "react-native";

import type { CountryCode } from "../../../../constants";

export interface AuthInputProps {
  label: string;
  value: string;
  placeholder: string;
  maxLength: number;
  keyboardType: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  /** Validation message; also switches the whole field to its error border. */
  error?: string;
  /** Selected country. Omit (with `countries`) to render a plain field without the dial-code prefix. */
  country?: CountryCode;
  countries?: readonly CountryCode[];
  onCountrySelect?: (code: string) => void;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  onSubmitEditing?: () => void;
}
