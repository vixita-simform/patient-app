import type { TimeSlotStatus } from '../../../../types';

export interface TimeSlotChipProps {
  /** 24h "HH:mm" slot key, passed back to `onPress`. */
  id: string;
  label: string;
  status: TimeSlotStatus;
  onPress: (id: string) => void;
}
