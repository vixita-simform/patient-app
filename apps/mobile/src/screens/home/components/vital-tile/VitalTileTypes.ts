import type { ComponentType } from 'react';

import type { VitalTone } from '../../../../constants';

export type { VitalTone };

export interface VitalTileProps {
  Icon: ComponentType<{ size?: number; color?: string }>;
  tone: VitalTone;
  value: string;
  unit?: string;
  label: string;
}
