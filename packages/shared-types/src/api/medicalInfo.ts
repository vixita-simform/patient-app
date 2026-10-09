import type { PatientBloodGroup, PatientDetail, PatientGender } from './patient';

export interface PatientAllergy {
  id: string;
  /** e.g. "Penicillin", "Peanuts". */
  allergen: string;
}

export interface PatientCondition {
  id: string;
  /** e.g. "Mild hypertension". */
  name: string;
}

export interface PatientEmergencyContact {
  id: string;
  name: string;
  /** Free text: "Spouse", "Father", "neighbor's" ... */
  relation: string;
  /** Mobile number with country code, e.g. "+919876543210". */
  phone: string;
}

/** API response shape for the patient's medical info (GET and PUT /api/patients/me/medical-info). */
export interface MedicalInfoResponse {
  patient: PatientDetail;
  allergies: PatientAllergy[];
  /** Active conditions only; resolved ones are history, not "existing". */
  conditions: PatientCondition[];
  /** The primary emergency contact; null when none is recorded. */
  emergencyContact: PatientEmergencyContact | null;
}

/**
 * Request body for PUT /api/patients/me/medical-info. Replaces the whole form: allergies
 * and conditions missing from the lists are removed (conditions are marked resolved).
 */
export interface UpdateMedicalInfoRequest {
  firstName: string;
  lastName: string;
  /** Calendar date "YYYY-MM-DD", not in the future. */
  dateOfBirth: string;
  gender: PatientGender;
  bloodGroup: PatientBloodGroup | null;
  allergies: string[];
  conditions: string[];
  /** Updates the primary emergency contact's name; null leaves contacts unchanged. */
  emergencyContactName: string | null;
}
