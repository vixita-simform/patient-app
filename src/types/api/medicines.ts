import type { DoseStatus, MedicineTint, StatusBadgeTone } from "../../constants";

/** One chip in the "Today's doses" strip. */
export interface DoseEntry {
  id: string;
  /** Display time, e.g. "8 AM". */
  time: string;
  status: DoseStatus;
}

/** One card in the active prescription's medicine list. */
export interface MedicineEntry {
  id: string;
  name: string;
  /** Badge label, e.g. "Taken", "6 PM", "Refill soon". */
  statusLabel: string;
  statusTone: StatusBadgeTone;
  /** Icon-box / stock-fill tint key, distinct from the badge tone (badge has no "blue"). */
  tintKey: MedicineTint;
  /** Dosage line, e.g. "1 tablet · after dinner · 30 days". */
  dosage: string;
  /** Units of stock remaining, e.g. 18 of 30. */
  stockRemaining: number;
  stockTotal: number;
  /** Shows the "Order refill" button when true (last/low-stock card). */
  showRefillButton: boolean;
}

/** The active prescription: prescriber, date, and its medicines. */
export interface ActivePrescription {
  prescriberName: string;
  /** Display date, e.g. "22 Sep". */
  date: string;
  medicines: readonly MedicineEntry[];
}

/** API response shape for the Medicines screen (GET /patients/me/medicines). */
export interface MedicinesResponse {
  doses: readonly DoseEntry[];
  activePrescription: ActivePrescription;
}
