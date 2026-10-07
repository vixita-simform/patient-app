import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import type { ButtonVariant } from '../../constants';

export interface CustomButtonProps {
  label: string;
  variant?: ButtonVariant;
  onPress?: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
  /** Shows a spinner in place of the icon and blocks presses while true. */
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  /** Optional leading element (e.g. an icon) rendered before the label. */
  icon?: ReactNode;
}
