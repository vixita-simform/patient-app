import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useCallback, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { BLOOD_GROUP, GENDER, STACK_ROUTES, Strings } from '../../constants';
import type { BloodGroup, Gender } from '../../constants';
import { usePatient } from '../../context';
import { formatDateWithYear, getInitials, goBackOr, parseDateOnly } from '../../utils';
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

/**
 * Local form state and handlers for the Personal & medical info screen.
 * There is no profile API yet, so Save, "+ Add" allergy and "Edit photo" return no handler
 * and render disabled instead of pretending to work.
 * @returns {UsePersonalAndMedicalInfoScreenReturn} Field values, options and handlers.
 */
export default function usePersonalAndMedicalInfoScreen(): UsePersonalAndMedicalInfoScreenReturn {
  const { patient } = usePatient();
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [gender, setGender] = useState<Gender>(GENDER.male);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | null>(null);
  // No profile API stores these yet, so they start empty instead of showing someone else's record.
  const [allergies, setAllergies] = useState<readonly ChipOption[]>([]);
  const [existingConditions, setExistingConditions] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');

  // Fill the form from the signed-in patient once it is known (and if the patient changes).
  // Adjusted during render rather than in an effect: https://react.dev/learn/you-might-not-need-an-effect
  const [syncedPatient, setSyncedPatient] = useState(patient);
  if (patient !== syncedPatient) {
    setSyncedPatient(patient);
    if (patient) {
      setFullName(`${patient.firstName} ${patient.lastName}`.trim());
      setGender(patient.gender);
      setBloodGroup(patient.bloodGroup);
      setDateOfBirth(patient.dateOfBirth ? parseDateOnly(patient.dateOfBirth) : null);
    }
  }

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
    emergencyContactPhone: '',
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
    onSavePress: undefined
  };
}
