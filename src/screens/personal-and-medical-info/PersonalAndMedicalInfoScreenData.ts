import { BLOOD_GROUP, GENDER } from "../../constants";
import type { PatientMedicalRecord } from "./PersonalAndMedicalInfoScreenTypes";

/**
 * Static stand-in for the patient record until an API exists. Swap this for the
 * API response (GET /patients/me/medical-info) when it lands.
 */
export const PATIENT_RECORD: PatientMedicalRecord = Object.freeze({
  initials: "AP",
  fullName: "Aarav Patel",
  dateOfBirth: new Date(1992, 2, 14),
  gender: GENDER.male,
  bloodGroup: BLOOD_GROUP.bPositive,
  allergies: Object.freeze([
    { id: "penicillin", label: "Penicillin" },
    { id: "peanuts", label: "Peanuts" },
  ]),
  existingConditions: "Mild hypertension",
  emergencyContactName: "Priya Patel (Spouse)",
  emergencyContactPhone: "98250 11223",
});
