import type { ComponentType } from 'react';

import type { IconTone } from '../../constants';

export interface IconBoxProps {
  /** Icon component following the icons' `size` / `color` props. */
  Icon: ComponentType<{ size?: number; color?: string }>;
  tone: IconTone;
}
