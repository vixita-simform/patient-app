import type { BloodGroup, Gender } from "../../constants";
import type { ChipOption } from "./components";

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
  genderOptions: readonly ChipOption<Gender>[];
  bloodGroupOptions: readonly ChipOption<BloodGroup>[];
  onFullNameChange: (text: string) => void;
  onDateOfBirthPress: () => void;
  onIosDateChange: (date: Date) => void;
  onDismissIosPicker: () => void;
  onGenderSelect: (id: Gender) => void;
  onBloodGroupSelect: (id: BloodGroup) => void;
  onAllergyRemove: (id: string) => void;
  /** Undefined until there is a way to enter an allergy; "+ Add" renders disabled. */
  onAllergyAdd?: () => void;
  onExistingConditionsChange: (text: string) => void;
  onEmergencyContactNameChange: (text: string) => void;
  /** Undefined until a photo picker exists; the pen button renders disabled. */
  onAvatarPress?: () => void;
  onBackPress: () => void;
  /** Undefined until the profile update API exists; "Save changes" renders disabled. */
  onSavePress?: () => void;
}
