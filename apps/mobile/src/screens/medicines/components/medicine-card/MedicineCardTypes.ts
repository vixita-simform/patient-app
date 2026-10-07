import type { MedicineEntry } from '../../../../types';

export interface MedicineCardProps {
  medicine: MedicineEntry;
  /** Omitted until a refill flow exists; the "Order refill" button then renders disabled. */
  onOrderRefillPress?: () => void;
}
