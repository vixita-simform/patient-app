import type { MedicineEntry } from "../../types";
import type { DoseChipData } from "./components";

/** Data the screen needs once derived from `medicinesDummyData`. */
export interface UseMedicinesScreenReturn {
  doses: readonly DoseChipData[];
  dosesTakenLabel: string;
  prescriberLine: string;
  medicines: readonly MedicineEntry[];
  onBackPress: () => void;
  /** Undefined until an "add medicine" flow exists; the header "+" renders disabled. */
  onAddPress?: () => void;
  /** Undefined until a refill flow exists; "Order refill" renders disabled. */
  onOrderRefillPress?: () => void;
}
