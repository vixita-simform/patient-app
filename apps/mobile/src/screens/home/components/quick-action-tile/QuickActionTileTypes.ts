import type { ComponentType } from 'react';

import type { QuickActionVariant } from '../../../../constants';

export type { QuickActionVariant };

export interface QuickActionTileProps {
  label: string;
  variant: QuickActionVariant;
  Icon: ComponentType<{ size?: number; color?: string }>;
  onPress?: () => void;
}
