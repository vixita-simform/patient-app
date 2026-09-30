import type { SpecialtyId } from "../../../../types";

export interface SpecialtyChipProps {
  id: SpecialtyId;
  label: string;
  active: boolean;
  onPress: (id: SpecialtyId) => void;
}
