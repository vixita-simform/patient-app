import type { DoseEntry, MedicineEntry } from "../../types";

/** Data the screen needs once derived from `medicinesDummyData`. */
export interface UseMedicinesScreenReturn {
  doses: readonly DoseEntry[];
  dosesTakenLabel: string;
  prescriberLine: string;
  medicines: readonly MedicineEntry[];
  onBackPress: () => void;
  onAddPress: () => void;
  onOrderRefillPress: () => void;
}
