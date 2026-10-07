import type { ReactNode } from 'react';

import type { IconButtonVariant } from '../../constants';

export interface IconButtonProps {
  children: ReactNode;
  onPress?: () => void;
  /** Dims the button and ignores presses. */
  disabled?: boolean;
  /** `outline` (default): bordered card square; `fill`: green square for a primary action. */
  variant?: IconButtonVariant;
  accessibilityLabel: string;
}
