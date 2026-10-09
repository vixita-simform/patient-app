import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';

import { BLOOD_GROUP, GENDER, HTTP_STATUS, STACK_ROUTES, Strings } from '../../constants';
import type { BloodGroup, Gender } from '../../constants';
import { usePatient } from '../../context';
import { ApiError, getMedicalInfo, updateMedicalInfo } from '../../services';
import type { MedicalInfoResponse, PatientAllergy } from '../../types';
import {
  formatDateWithYear,
  getAuthToken,
  getInitials,
  goBackOr,
  parseDateOnly,
  toLocalDayId
} from '../../utils';
import type { ChipOption } from './components';
import type { UsePersonalAndMedicalInfoScreenReturn } from './PersonalAndMedicalInfoScreenTypes';

const COPY = Strings.PersonalAndMedicalInfoScreen;
const COMMON = Strings.Common;

const GENDER_OPTIONS: readonly ChipOption<Gender>[] = Object.freeze([
  { id: GENDER.male, label: COPY.male },
  { id: GENDER.female, label: COPY.female },
  { id: GENDER.other, label: COPY.other }
]);

const BLOOD_GROUP_OPTIONS: readonly ChipOption<BloodGroup>[] = Object.freeze([
  { id: BLOOD_GROUP.aPositive, label: COMMON.bloodAPositive },
  { id: BLOOD_GROUP.aNegative, label: COMMON.bloodANegative },
  { id: BLOOD_GROUP.bPositive, label: COMMON.bloodBPositive },
  { id: BLOOD_GROUP.bNegative, label: COMMON.bloodBNegative },
  { id: BLOOD_GROUP.oPositive, label: COMMON.bloodOPositive },
  { id: BLOOD_GROUP.oNegative, label: COMMON.bloodONegative },
  { id: BLOOD_GROUP.abPositive, label: COMMON.bloodABPositive },
  { id: BLOOD_GROUP.abNegative, label: COMMON.bloodABNegative }
]);

/** The date picker is a modal component on iOS; Android uses the imperative API. */
const SHOULD_RENDER_IOS_PICKER = Platform.OS === 'ios';

/** Existing conditions are one comma-separated text field on the form, a list in the API. */
const CONDITION_SEPARATOR = ', ';

const toAllergyChips = (allergies: readonly PatientAllergy[]): readonly ChipOption[] =>
  allergies.map(({ id, allergen }) => ({ id, label: allergen }));

/** Splits "a, b ,, c" into ["a", "b", "c"]. */
const splitList = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

/** First word is the first name; the rest (possibly empty) is the last name. */
const splitFullName = (fullName: string): { firstName: string; lastName: string } => {
  const [firstName = '', ...rest] = fullName.trim().split(/\s+/);
  return { firstName, lastName: rest.join(' ') };
};

/**
 * A message safe to show for a failed load or save.
 * @param {unknown} error - what the API call threw.
 * @param {string} fallback - shown for anything but an expired session.
 * @returns {string} The alert message.
 */
const toErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof ApiError && error.status === HTTP_STATUS.unauthorized
    ? COPY.sessionExpired
    : fallback;

/**
 * Reads the stored access token.
 * @returns {Promise<string>} The token.
 * @throws {ApiError} 401 when the patient is not signed in.
 */
const requireAuthToken = async (): Promise<string> => {
  const token = await getAuthToken();
  if (!token) {
    throw new ApiError(HTTP_STATUS.unauthorized, COPY.sessionExpired);
  }
  return token;
};

/**
 * Form state and handlers for the Personal & medical info screen. The form starts from the
 * stored patient, is then filled from GET /api/patients/me/medical-info, and Save sends it
 * back with PUT. "+ Add" allergy and "Edit photo" have no input UI yet, so they return no
 * handler and render disabled instead of pretending to work.
 * @returns {UsePersonalAndMedicalInfoScreenReturn} Field values, options and handlers.
 */
export default function usePersonalAndMedicalInfoScreen(): UsePersonalAndMedicalInfoScreenReturn {
  const { patient, savePatient } = usePatient();
  const [medicalInfo, setMedicalInfo] = useState<MedicalInfoResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [gender, setGender] = useState<Gender>(GENDER.male);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | null>(null);
  const [allergies, setAllergies] = useState<readonly ChipOption[]>([]);
  const [existingConditions, setExistingConditions] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');

  // Fill the form from the signed-in patient until the API answers, so it is not blank meanwhile.
  // Adjusted during render rather than in an effect: https://react.dev/learn/you-might-not-need-an-effect
  const [syncedPatient, setSyncedPatient] = useState(patient);
  if (patient !== syncedPatient) {
    setSyncedPatient(patient);
    // Once the API has answered it wins; a late restore of the stored patient must not overwrite it.
    if (patient && !medicalInfo) {
      setFullName(`${patient.firstName} ${patient.lastName}`.trim());
      setGender(patient.gender);
      setBloodGroup(patient.bloodGroup);
      setDateOfBirth(patient.dateOfBirth ? parseDateOnly(patient.dateOfBirth) : null);
    }
  }

  // Fill the whole form each time the API returns medical info (on load and after a save).
  const [syncedMedicalInfo, setSyncedMedicalInfo] = useState(medicalInfo);
  if (medicalInfo !== syncedMedicalInfo) {
    setSyncedMedicalInfo(medicalInfo);
    if (medicalInfo) {
      const { patient: detail } = medicalInfo;
      setFullName(`${detail.firstName} ${detail.lastName}`.trim());
      setGender(detail.gender);
      setBloodGroup(detail.bloodGroup);
      setDateOfBirth(detail.dateOfBirth ? parseDateOnly(detail.dateOfBirth) : null);
      setAllergies(toAllergyChips(medicalInfo.allergies));
      setExistingConditions(
        medicalInfo.conditions.map(({ name }) => name).join(CONDITION_SEPARATOR)
      );
      setEmergencyContactName(medicalInfo.emergencyContact?.name ?? '');
    }
  }

  useEffect(() => {
    let isActive = true;
    const load = async (): Promise<void> => {
      try {
        const response = await getMedicalInfo(await requireAuthToken());
        if (isActive) {
          setMedicalInfo(response);
        }
      } catch (error) {
        if (isActive) {
          Alert.alert(toErrorMessage(error, COPY.loadFailed));
        }
      }
    };
    load();
    return () => {
      isActive = false;
    };
  }, []);

  const [isIosPickerVisible, setIsIosPickerVisible] = useState(false);
  const maximumDate = useMemo(() => new Date(), []);
  const dateOfBirthLabel = dateOfBirth ? formatDateWithYear(dateOfBirth) : '';

  /** Opens the native date picker: Android's imperative API, iOS's modal component. */
  const onDateOfBirthPress = useCallback((): void => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: dateOfBirth ?? maximumDate,
        mode: 'date',
        display: 'calendar',
        maximumDate,
        onChange: (event, date) => {
          // Only a confirmed pick changes the date; dismissing keeps the current one.
          if (event.type === 'set' && date) {
            setDateOfBirth(date);
          }
        }
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

  const hasEmergencyContact = medicalInfo?.emergencyContact != null;
  // Save needs the loaded record (so lists are never wiped by an empty form) and the required fields.
  const canSave =
    medicalInfo !== null &&
    !isSaving &&
    fullName.trim().length > 0 &&
    dateOfBirth !== null &&
    (!hasEmergencyContact || emergencyContactName.trim().length > 0);

  const onSavePress = useCallback((): void => {
    if (!dateOfBirth) {
      return;
    }
    const save = async (): Promise<void> => {
      setIsSaving(true);
      try {
        const response = await updateMedicalInfo(await requireAuthToken(), {
          ...splitFullName(fullName),
          dateOfBirth: toLocalDayId(dateOfBirth),
          gender,
          bloodGroup,
          allergies: allergies.map(({ label }) => label),
          conditions: splitList(existingConditions),
          emergencyContactName: hasEmergencyContact ? emergencyContactName.trim() : null
        });
        setMedicalInfo(response);
        // Keep Profile and Home in step; the server already has the change if storage fails.
        await savePatient(response.patient).catch(() => undefined);
        Alert.alert(COPY.saved);
      } catch (error) {
        Alert.alert(toErrorMessage(error, COMMON.somethingWentWrong));
      } finally {
        setIsSaving(false);
      }
    };
    save();
  }, [
    allergies,
    bloodGroup,
    dateOfBirth,
    emergencyContactName,
    existingConditions,
    fullName,
    gender,
    hasEmergencyContact,
    savePatient
  ]);

  return {
    initials: getInitials(fullName),
    fullName,
    dateOfBirth: dateOfBirth ?? maximumDate,
    dateOfBirthLabel,
    maximumDate,
    isIosPickerVisible,
    shouldRenderIosPicker: SHOULD_RENDER_IOS_PICKER,
    gender,
    bloodGroup,
    allergies,
    existingConditions,
    emergencyContactName,
    emergencyContactPhone: medicalInfo?.emergencyContact?.phone ?? '',
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
    onSavePress: canSave ? onSavePress : undefined
  };
}
