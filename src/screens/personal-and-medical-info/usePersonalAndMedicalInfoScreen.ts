import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Platform } from "react-native";

import { BLOOD_GROUP, GENDER, STACK_ROUTES, Strings } from "../../constants";
import type { BloodGroup, Gender } from "../../constants";
import { formatDateWithYear } from "../../utils";
import type { ChipOption } from "./components";
import { PATIENT_RECORD } from "./PersonalAndMedicalInfoScreenData";
import type { UsePersonalAndMedicalInfoScreenReturn } from "./PersonalAndMedicalInfoScreenTypes";

const COPY = Strings.PersonalAndMedicalInfoScreen;

const GENDER_OPTIONS: readonly ChipOption[] = Object.freeze([
  { id: GENDER.male, label: COPY.male },
  { id: GENDER.female, label: COPY.female },
  { id: GENDER.other, label: COPY.other },
]);

const BLOOD_GROUP_OPTIONS: readonly ChipOption[] = Object.freeze([
  { id: BLOOD_GROUP.aPositive, label: COPY.bloodAPositive },
  { id: BLOOD_GROUP.aNegative, label: COPY.bloodANegative },
  { id: BLOOD_GROUP.bPositive, label: COPY.bloodBPositive },
  { id: BLOOD_GROUP.bNegative, label: COPY.bloodBNegative },
  { id: BLOOD_GROUP.oPositive, label: COPY.bloodOPositive },
  { id: BLOOD_GROUP.oNegative, label: COPY.bloodONegative },
  { id: BLOOD_GROUP.abPositive, label: COPY.bloodABPositive },
  { id: BLOOD_GROUP.abNegative, label: COPY.bloodABNegative },
]);

/** The date picker is a modal component on iOS; Android uses the imperative API. */
const SHOULD_RENDER_IOS_PICKER = Platform.OS === "ios";

/** Pops back when there is history, otherwise lands on Home (e.g. after a deep link). */
const goBackOrHome = (): void => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(STACK_ROUTES.home);
  }
};

/**
 * Local form state and handlers for the Personal & medical info screen.
 * Save simply returns to the previous screen: there is no API yet.
 * @returns {UsePersonalAndMedicalInfoScreenReturn} Field values, options and handlers.
 */
export default function usePersonalAndMedicalInfoScreen(): UsePersonalAndMedicalInfoScreenReturn {
  const [fullName, setFullName] = useState(PATIENT_RECORD.fullName);
  const [dateOfBirth, setDateOfBirth] = useState(PATIENT_RECORD.dateOfBirth);
  const [gender, setGender] = useState<Gender>(PATIENT_RECORD.gender);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(PATIENT_RECORD.bloodGroup);
  const [allergies, setAllergies] = useState<readonly ChipOption[]>(PATIENT_RECORD.allergies);
  const [existingConditions, setExistingConditions] = useState(PATIENT_RECORD.existingConditions);
  const [emergencyContactName, setEmergencyContactName] = useState(
    PATIENT_RECORD.emergencyContactName,
  );

  const [isIosPickerVisible, setIsIosPickerVisible] = useState(false);
  const maximumDate = useMemo(() => new Date(), []);
  const dateOfBirthLabel = formatDateWithYear(dateOfBirth);

  /** Opens the native date picker: Android's imperative API, iOS's modal component. */
  const onDateOfBirthPress = useCallback((): void => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: dateOfBirth,
        mode: "date",
        display: "calendar",
        maximumDate,
        onChange: (_event, date) => {
          if (date) {
            setDateOfBirth(date);
          }
        },
      });
      return;
    }
    setIsIosPickerVisible(true);
  }, [dateOfBirth, maximumDate]);

  const onIosDateChange = useCallback((date: Date): void => {
    setIsIosPickerVisible(false);
    setDateOfBirth(date);
  }, []);

  const onDismissIosPicker = useCallback((): void => {
    setIsIosPickerVisible(false);
  }, []);

  const onGenderSelect = useCallback((id: string): void => {
    setGender(id as Gender);
  }, []);

  const onBloodGroupSelect = useCallback((id: string): void => {
    setBloodGroup(id as BloodGroup);
  }, []);

  const onAllergyRemove = useCallback((id: string): void => {
    setAllergies((current) => current.filter((allergy) => allergy.id !== id));
  }, []);

  const onAllergyAdd = useCallback((): void => {
    // Placeholder: the design does not show how an allergy is entered.
  }, []);

  const onAvatarPress = useCallback((): void => {
    // Placeholder: the design does not show the photo-change target.
  }, []);

  const onBackPress = useCallback((): void => {
    goBackOrHome();
  }, []);

  const onSavePress = useCallback((): void => {
    // No API yet: pop back to the Profile tab (or Home when there is no history).
    goBackOrHome();
  }, []);

  return {
    initials: PATIENT_RECORD.initials,
    fullName,
    dateOfBirth,
    dateOfBirthLabel,
    maximumDate,
    isIosPickerVisible,
    shouldRenderIosPicker: SHOULD_RENDER_IOS_PICKER,
    gender,
    bloodGroup,
    allergies,
    existingConditions,
    emergencyContactName,
    emergencyContactPhone: PATIENT_RECORD.emergencyContactPhone,
    genderOptions: GENDER_OPTIONS,
    bloodGroupOptions: BLOOD_GROUP_OPTIONS,
    onFullNameChange: setFullName,
    onDateOfBirthPress,
    onIosDateChange,
    onDismissIosPicker,
    onGenderSelect,
    onBloodGroupSelect,
    onAllergyRemove,
    onAllergyAdd,
    onExistingConditionsChange: setExistingConditions,
    onEmergencyContactNameChange: setEmergencyContactName,
    onAvatarPress,
    onBackPress,
    onSavePress,
  };
}
