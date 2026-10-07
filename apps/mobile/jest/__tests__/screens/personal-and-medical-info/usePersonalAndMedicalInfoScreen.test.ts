import type { PatientDetail } from '@patient-app/shared-types';
import { act, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { BLOOD_GROUP, GENDER, STACK_ROUTES } from '../../../../src/constants';
import usePersonalAndMedicalInfoScreen from '../../../../src/screens/personal-and-medical-info/usePersonalAndMedicalInfoScreen';
import { RenderWrapperForHooks } from '../../../Wrapper';

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

jest.mock('../../../../src/utils', () => ({
  ...jest.requireActual('../../../../src/utils'),
  getStoredPatient: jest.fn(() => Promise.resolve(mockPatient))
}));

/** Renders the hook and waits for the stored patient to fill the form. */
const renderScreenHook = async () => {
  const hook = await RenderWrapperForHooks(() => usePersonalAndMedicalInfoScreen());
  await waitFor(() => expect(hook.result.current.fullName).toBe('Aarav Sharma'));
  return hook;
};

describe('usePersonalAndMedicalInfoScreen', () => {
  it('starts from the signed-in patient and leaves unknown medical details empty', async () => {
    const { result } = await renderScreenHook();
    expect(result.current.fullName).toBe('Aarav Sharma');
    expect(result.current.initials).toBe('AS');
    expect(result.current.dateOfBirthLabel).toBe('14 Mar 1992');
    expect(result.current.gender).toBe(GENDER.female);
    expect(result.current.bloodGroup).toBe(BLOOD_GROUP.oNegative);
    expect(result.current.allergies).toEqual([]);
    expect(result.current.existingConditions).toBe('');
    expect(result.current.emergencyContactName).toBe('');
    expect(result.current.isIosPickerVisible).toBe(false);
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

  it('returns no save, add-allergy or photo handlers until those APIs exist', async () => {
    const { result } = await renderScreenHook();
    expect(result.current.onSavePress).toBeUndefined();
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
