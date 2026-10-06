import type { BloodGroup, Gender } from "../../constants";

/** One allergy chip on the medical info form. */
export interface Allergy {
  id: string;
  label: string;
}

/** The signed-in patient's profile and medical info (GET /patients/me/profile). */
export interface PatientProfile {
  id: string;
  initials: string;
  firstName: string;
  lastName: string;
  /** Hospital unique health ID, e.g. "CW-2024-08812". */
  uhid: string;
  phone: string;
  /** Calendar date, "YYYY-MM-DD" (no time or time zone). */
  dateOfBirth: string;
  gender: Gender;
  bloodGroup: BloodGroup;
  weightKg: number;
  familyCount: number;
  allergies: readonly Allergy[];
  existingConditions: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}
