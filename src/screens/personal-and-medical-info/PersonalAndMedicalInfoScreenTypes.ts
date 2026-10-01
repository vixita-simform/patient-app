import type { BloodGroup, Gender } from "../../constants";
import type { ChipOption } from "./components";

/** Static stand-in for the patient's editable record. */
export interface PatientMedicalRecord {
  initials: string;
  fullName: string;
  dateOfBirth: Date;
  gender: Gender;
  bloodGroup: BloodGroup;
  allergies: readonly ChipOption[];
  existingConditions: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface UsePersonalAndMedicalInfoScreenReturn {
  initials: string;
  fullName: string;
  dateOfBirth: Date;
  dateOfBirthLabel: string;
  /** Latest selectable birth date (today). */
  maximumDate: Date;
  isIosPickerVisible: boolean;
  /** True on iOS, where the date picker is a modal component the screen must render. */
  shouldRenderIosPicker: boolean;
  gender: Gender;
  bloodGroup: BloodGroup;
  allergies: readonly ChipOption[];
  existingConditions: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  genderOptions: readonly ChipOption[];
  bloodGroupOptions: readonly ChipOption[];
  onFullNameChange: (text: string) => void;
  onDateOfBirthPress: () => void;
  onIosDateChange: (date: Date) => void;
  onDismissIosPicker: () => void;
  onGenderSelect: (id: string) => void;
  onBloodGroupSelect: (id: string) => void;
  onAllergyRemove: (id: string) => void;
  onAllergyAdd: () => void;
  onExistingConditionsChange: (text: string) => void;
  onEmergencyContactNameChange: (text: string) => void;
  onAvatarPress: () => void;
  onBackPress: () => void;
  onSavePress: () => void;
}
