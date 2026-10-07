import type { ReactNode } from 'react';

import type { ScreenHeaderVariant } from '../../constants';

export interface ScreenHeaderProps {
  title: string;
  /** Shows the back button when set. */
  onBackPress?: () => void;
  /** Trailing action, e.g. an `IconButton` or a text action. */
  right?: ReactNode;
  /** `centered` (default) for stack screens, `large` for tab roots. */
  variant?: ScreenHeaderVariant;
}
