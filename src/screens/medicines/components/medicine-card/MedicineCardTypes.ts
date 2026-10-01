import type { MedicineEntry } from "../../../../types";

export interface MedicineCardProps {
  medicine: MedicineEntry;
  onOrderRefillPress: () => void;
}
