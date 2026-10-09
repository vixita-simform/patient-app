import type { MedicalInfoResponse, PatientDetail } from '@patient-app/shared-types';
import { act, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Alert } from 'react-native';

import { BLOOD_GROUP, GENDER, STACK_ROUTES, Strings } from '../../../../src/constants';
import usePersonalAndMedicalInfoScreen from '../../../../src/screens/personal-and-medical-info/usePersonalAndMedicalInfoScreen';
import { ApiError, getMedicalInfo, updateMedicalInfo } from '../../../../src/services';
import { getAuthToken } from '../../../../src/utils';
import { RenderWrapperForHooks } from '../../../Wrapper';

const COPY = Strings.PersonalAndMedicalInfoScreen;

const mockPatient: PatientDetail = {
  id: 'p_001',
  uhid: 'CW-2024-08813',
  firstName: 'Aarav',
  lastName: 'Sharma',
  phone: '+919876543210',
  email: 'aarav.sharma@example.com',
  gender: 'female',
  bloodGroup: 'O-',
  dateOfBirth: '1992-03-14',
  weight: 72
};

const mockMedicalInfo: MedicalInfoResponse = {
  patient: mockPatient,
  allergies: [
    { id: 'a1', allergen: 'Penicillin' },
    { id: 'a2', allergen: 'Peanuts' }
  ],
  conditions: [
    { id: 'c1', name: 'Mild hypertension' },
    { id: 'c2', name: 'Asthma' }
  ],
  emergencyContact: { id: 'e1', name: 'Priya Sharma', relation: 'Spouse', phone: '+919800000000' }
};

jest.mock('../../../../src/utils', () => ({
  ...jest.requireActual('../../../../src/utils'),
  getStoredPatient: jest.fn(() => Promise.resolve(mockPatient)),
  setStoredPatient: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('token'))
}));

jest.mock('../../../../src/services', () => ({
  ...jest.requireActual('../../../../src/services'),
  getMedicalInfo: jest.fn(),
  updateMedicalInfo: jest.fn()
}));

const mockedGetMedicalInfo = jest.mocked(getMedicalInfo);
const mockedUpdateMedicalInfo = jest.mocked(updateMedicalInfo);

/** Renders the hook and waits for the medical info API to fill the form. */
const renderScreenHook = async () => {
  const hook = await RenderWrapperForHooks(() => usePersonalAndMedicalInfoScreen());
  await waitFor(() => expect(hook.result.current.existingConditions).not.toBe(''));
  return hook;
};

describe('usePersonalAndMedicalInfoScreen', () => {
  beforeEach(() => {
    mockedGetMedicalInfo.mockResolvedValue(mockMedicalInfo);
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows the stored patient while the API loads, with Save disabled', async () => {
    mockedGetMedicalInfo.mockReturnValue(new Promise(() => {}));
    const hook = await RenderWrapperForHooks(() => usePersonalAndMedicalInfoScreen());
    await waitFor(() => expect(hook.result.current.fullName).toBe('Aarav Sharma'));
    expect(hook.result.current.allergies).toEqual([]);
    expect(hook.result.current.onSavePress).toBeUndefined();
  });

  it('fills the form from the medical info API', async () => {
    const { result } = await renderScreenHook();
    expect(mockedGetMedicalInfo).toHaveBeenCalledWith('token');
    expect(result.current.fullName).toBe('Aarav Sharma');
    expect(result.current.initials).toBe('AS');
    expect(result.current.dateOfBirthLabel).toBe('14 Mar 1992');
    expect(result.current.gender).toBe(GENDER.female);
    expect(result.current.bloodGroup).toBe(BLOOD_GROUP.oNegative);
    expect(result.current.allergies).toEqual([
      { id: 'a1', label: 'Penicillin' },
      { id: 'a2', label: 'Peanuts' }
    ]);
    expect(result.current.existingConditions).toBe('Mild hypertension, Asthma');
    expect(result.current.emergencyContactName).toBe('Priya Sharma');
    expect(result.current.emergencyContactPhone).toBe('+919800000000');
    expect(result.current.isIosPickerVisible).toBe(false);
  });

  it('alerts when the medical info cannot be loaded', async () => {
    mockedGetMedicalInfo.mockRejectedValue(new ApiError(500, 'boom'));
    await RenderWrapperForHooks(() => usePersonalAndMedicalInfoScreen());
    await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith(COPY.loadFailed));
  });

  it('asks to sign in again when there is no token', async () => {
    jest.mocked(getAuthToken).mockResolvedValueOnce(null);
    await RenderWrapperForHooks(() => usePersonalAndMedicalInfoScreen());
    await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith(COPY.sessionExpired));
    expect(mockedGetMedicalInfo).not.toHaveBeenCalled();
  });

  it('saves the edited form and refreshes it from the response', async () => {
    const saved: MedicalInfoResponse = {
      ...mockMedicalInfo,
      patient: { ...mockPatient, firstName: 'Aarav Kumar' },
      allergies: [{ id: 'a2', allergen: 'Peanuts' }]
    };
    mockedUpdateMedicalInfo.mockResolvedValue(saved);
    const { result } = await renderScreenHook();
    await act(() => result.current.onFullNameChange('  Aarav Kumar Sharma '));
    await act(() => result.current.onAllergyRemove('a1'));
    await act(() => result.current.onExistingConditionsChange('Asthma, , Diabetes '));
    await act(() => result.current.onSavePress?.());
    await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith(COPY.saved));
    expect(mockedUpdateMedicalInfo).toHaveBeenCalledWith('token', {
      firstName: 'Aarav',
      lastName: 'Kumar Sharma',
      dateOfBirth: '1992-03-14',
      gender: GENDER.female,
      bloodGroup: BLOOD_GROUP.oNegative,
      allergies: ['Peanuts'],
      conditions: ['Asthma', 'Diabetes'],
      emergencyContactName: 'Priya Sharma'
    });
    expect(result.current.allergies).toEqual([{ id: 'a2', label: 'Peanuts' }]);
    expect(result.current.onSavePress).toBeDefined();
  });

  it('sends no emergency contact name when the patient has no contact', async () => {
    mockedGetMedicalInfo.mockResolvedValue({ ...mockMedicalInfo, emergencyContact: null });
    mockedUpdateMedicalInfo.mockResolvedValue(mockMedicalInfo);
    const { result } = await renderScreenHook();
    await act(() => result.current.onSavePress?.());
    await waitFor(() => expect(mockedUpdateMedicalInfo).toHaveBeenCalled());
    expect(mockedUpdateMedicalInfo.mock.calls[0][1].emergencyContactName).toBeNull();
  });

  it('alerts when saving fails', async () => {
    mockedUpdateMedicalInfo.mockRejectedValue(new ApiError(401, 'expired'));
    const { result } = await renderScreenHook();
    await act(() => result.current.onSavePress?.());
    await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith(COPY.sessionExpired));
  });

  it('disables Save while a required field is empty', async () => {
    const { result } = await renderScreenHook();
    await act(() => result.current.onFullNameChange(' '));
    expect(result.current.onSavePress).toBeUndefined();
    await act(() => result.current.onFullNameChange('Aarav'));
    await act(() => result.current.onEmergencyContactNameChange(''));
    expect(result.current.onSavePress).toBeUndefined();
  });

  it('opens the iOS picker, then commits the date and closes it', async () => {
    const { result } = await renderScreenHook();
    expect(result.current.shouldRenderIosPicker).toBe(true);
    await act(() => result.current.onDateOfBirthPress());
    expect(result.current.isIosPickerVisible).toBe(true);
    await act(() => result.current.onIosDateChange(new Date(1990, 0, 5)));
    expect(result.current.isIosPickerVisible).toBe(false);
    expect(result.current.dateOfBirthLabel).toBe('5 Jan 1990');
  });

  it('dismissing the iOS picker keeps the date', async () => {
    const { result } = await renderScreenHook();
    await act(() => result.current.onDateOfBirthPress());
    await act(() => result.current.onDismissIosPicker());
    expect(result.current.isIosPickerVisible).toBe(false);
    expect(result.current.dateOfBirthLabel).toBe('14 Mar 1992');
  });

  it('returns no add-allergy or photo handlers until those inputs exist', async () => {
    const { result } = await renderScreenHook();
    expect(result.current.onAllergyAdd).toBeUndefined();
    expect(result.current.onAvatarPress).toBeUndefined();
  });

  it('selects gender and blood group by their typed ids', async () => {
    const { result } = await renderScreenHook();
    await act(() => result.current.onGenderSelect(GENDER.female));
    await act(() => result.current.onBloodGroupSelect(BLOOD_GROUP.oNegative));
    expect(result.current.gender).toBe(GENDER.female);
    expect(result.current.bloodGroup).toBe(BLOOD_GROUP.oNegative);
  });

  it('goes back when there is history', async () => {
    jest.mocked(router.canGoBack).mockReturnValueOnce(true);
    const { result } = await renderScreenHook();
    result.current.onBackPress();
    expect(router.back).toHaveBeenCalledTimes(1);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('falls back to Home without history', async () => {
    jest.mocked(router.canGoBack).mockReturnValueOnce(false);
    const { result } = await renderScreenHook();
    result.current.onBackPress();
    expect(router.replace).toHaveBeenCalledWith(STACK_ROUTES.home);
    expect(router.back).not.toHaveBeenCalled();
  });
});
