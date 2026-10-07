import type { PatientDetail } from '@patient-app/shared-types';

export interface PatientContextValue {
  /** Null while signed out, or until the stored patient has been restored. */
  patient: PatientDetail | null;
  /** True until the stored patient has been read at launch. */
  isLoading: boolean;
  /** Stores the patient in memory and in secure storage. */
  savePatient: (patient: PatientDetail) => Promise<void>;
  /** Removes the patient from memory and from secure storage. */
  clearPatient: () => Promise<void>;
}
