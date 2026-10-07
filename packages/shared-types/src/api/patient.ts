import type { PatientSummary } from './home';

/** Gender options a patient can be registered with. */
export type PatientGender = 'male' | 'female' | 'other';

/** Blood groups a patient can be registered with; same values as the database's `blood_group` enum. */
export type PatientBloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';

/** The signed-in patient's identity and contact details, returned on sign-in. */
export interface PatientDetail extends PatientSummary {
  /** Hospital unique health ID (UHID), e.g. "CW-2024-08813". */
  uhid: string;
  /** Registered mobile number with country code, e.g. "+919876543210". */
  phone: string;
  email: string;
  gender: PatientGender;
  bloodGroup: PatientBloodGroup | null;
  /** Calendar date "YYYY-MM-DD" (no time zone), or null when not recorded. */
  dateOfBirth: string | null;
  weight: number | null;
}
