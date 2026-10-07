import type { PatientDetail } from '@patient-app/shared-types';
import { act, waitFor } from '@testing-library/react-native';

import { usePatient } from '../../../src/context';
import { clearStoredPatient, getStoredPatient, setStoredPatient } from '../../../src/utils';
import { RenderWrapperForHooks } from '../../Wrapper';

jest.mock('../../../src/utils', () => ({
  ...jest.requireActual('../../../src/utils'),
  getStoredPatient: jest.fn(),
  setStoredPatient: jest.fn(() => Promise.resolve()),
  clearStoredPatient: jest.fn(() => Promise.resolve())
}));

const PATIENT: PatientDetail = {
  id: 'p_001',
  uhid: 'CW-2024-08813',
  firstName: 'Aarav',
  lastName: 'Sharma',
  phone: '+919876543210',
  email: 'aarav.sharma@example.com',
  gender: 'male',
  bloodGroup: 'B+',
  dateOfBirth: null,
  weight: null
};

const mockedGetStoredPatient = jest.mocked(getStoredPatient);

describe('PatientContext', () => {
  it('restores the stored patient on launch', async () => {
    mockedGetStoredPatient.mockResolvedValue(PATIENT);
    const { result } = await RenderWrapperForHooks(usePatient);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.patient).toEqual(PATIENT);
  });

  it('has no patient when nothing is stored', async () => {
    mockedGetStoredPatient.mockResolvedValue(null);
    const { result } = await RenderWrapperForHooks(usePatient);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.patient).toBeNull();
  });

  it('stops loading with no patient when the stored read fails', async () => {
    mockedGetStoredPatient.mockRejectedValue(new Error('keychain unavailable'));
    const { result } = await RenderWrapperForHooks(usePatient);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.patient).toBeNull();
  });

  it('saves the patient to state and secure storage, then clears both', async () => {
    mockedGetStoredPatient.mockResolvedValue(null);
    const { result } = await RenderWrapperForHooks(usePatient);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => result.current.savePatient(PATIENT));
    expect(setStoredPatient).toHaveBeenCalledWith(PATIENT);
    expect(result.current.patient).toEqual(PATIENT);

    await act(async () => result.current.clearPatient());
    expect(clearStoredPatient).toHaveBeenCalledTimes(1);
    expect(result.current.patient).toBeNull();
  });

  it('does not bring a cleared patient back when the launch restore finishes late', async () => {
    let finishRestore: (value: PatientDetail | null) => void = () => {};
    mockedGetStoredPatient.mockReturnValue(
      new Promise((resolve) => {
        finishRestore = resolve;
      })
    );
    const { result } = await RenderWrapperForHooks(usePatient);

    await act(async () => result.current.clearPatient());
    await act(async () => finishRestore(PATIENT));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.patient).toBeNull();
  });
});
