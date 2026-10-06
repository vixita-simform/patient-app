import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useCallback, useMemo, useState } from "react";
import { Platform } from "react-native";

import {
  BLOOD_GROUP,
  GENDER,
  patientProfileDummyData,
  STACK_ROUTES,
  Strings,
} from "../../constants";
import type { BloodGroup, Gender } from "../../constants";
import { formatDateWithYear, goBackOr, parseDateOnly } from "../../utils";
import type { ChipOption } from "./components";
import type { UsePersonalAndMedicalInfoScreenReturn } from "./PersonalAndMedicalInfoScreenTypes";

const COPY = Strings.PersonalAndMedicalInfoScreen;
const COMMON = Strings.Common;

const GENDER_OPTIONS: readonly ChipOption<Gender>[] = Object.freeze([
  { id: GENDER.male, label: COPY.male },
  { id: GENDER.female, label: COPY.female },
  { id: GENDER.other, label: COPY.other },
]);

const BLOOD_GROUP_OPTIONS: readonly ChipOption<BloodGroup>[] = Object.freeze([
  { id: BLOOD_GROUP.aPositive, label: COMMON.bloodAPositive },
  { id: BLOOD_GROUP.aNegative, label: COMMON.bloodANegative },
  { id: BLOOD_GROUP.bPositive, label: COMMON.bloodBPositive },
  { id: BLOOD_GROUP.bNegative, label: COMMON.bloodBNegative },
  { id: BLOOD_GROUP.oPositive, label: COMMON.bloodOPositive },
  { id: BLOOD_GROUP.oNegative, label: COMMON.bloodONegative },
  { id: BLOOD_GROUP.abPositive, label: COMMON.bloodABPositive },
  { id: BLOOD_GROUP.abNegative, label: COMMON.bloodABNegative },
]);

/** The date picker is a modal component on iOS; Android uses the imperative API. */
const SHOULD_RENDER_IOS_PICKER = Platform.OS === "ios";

const PATIENT = patientProfileDummyData;

/**
 * Local form state and handlers for the Personal & medical info screen.
 * There is no profile API yet, so Save, "+ Add" allergy and "Edit photo" return no handler
 * and render disabled instead of pretending to work.
 * @returns {UsePersonalAndMedicalInfoScreenReturn} Field values, options and handlers.
 */
export default function usePersonalAndMedicalInfoScreen(): UsePersonalAndMedicalInfoScreenReturn {
  const [fullName, setFullName] = useState(`${PATIENT.firstName} ${PATIENT.lastName}`);
  const [dateOfBirth, setDateOfBirth] = useState(() => parseDateOnly(PATIENT.dateOfBirth));
  const [gender, setGender] = useState<Gender>(PATIENT.gender);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(PATIENT.bloodGroup);
  const [allergies, setAllergies] = useState<readonly ChipOption[]>(PATIENT.allergies);
  const [existingConditions, setExistingConditions] = useState(PATIENT.existingConditions);
  const [emergencyContactName, setEmergencyContactName] = useState(PATIENT.emergencyContactName);

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
        onChange: (event, date) => {
          // Only a confirmed pick changes the date; dismissing keeps the current one.
          if (event.type === "set" && date) {
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

  const onGenderSelect = useCallback((id: Gender): void => {
    setGender(id);
  }, []);

  const onBloodGroupSelect = useCallback((id: BloodGroup): void => {
    setBloodGroup(id);
  }, []);

  const onAllergyRemove = useCallback((id: string): void => {
    setAllergies((current) => current.filter((allergy) => allergy.id !== id));
  }, []);

  const onBackPress = useCallback((): void => {
    goBackOr(STACK_ROUTES.home);
  }, []);

  return {
    initials: PATIENT.initials,
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
    emergencyContactPhone: PATIENT.emergencyContactPhone,
    genderOptions: GENDER_OPTIONS,
    bloodGroupOptions: BLOOD_GROUP_OPTIONS,
    onFullNameChange: setFullName,
    onDateOfBirthPress,
    onIosDateChange,
    onDismissIosPicker,
    onGenderSelect,
    onBloodGroupSelect,
    onAllergyRemove,
    onAllergyAdd: undefined,
    onExistingConditionsChange: setExistingConditions,
    onEmergencyContactNameChange: setEmergencyContactName,
    onAvatarPress: undefined,
    onBackPress,
    onSavePress: undefined,
  };
}
