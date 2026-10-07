import * as SecureStore from 'expo-secure-store';

import {
  clearAuthToken,
  clearStoredPatient,
  getAuthToken,
  getStoredPatient,
  setAuthToken,
  setStoredPatient
} from '../../../src/utils';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 6
}));

const mockedStore = jest.mocked(SecureStore);

describe('authStorage', () => {
  it('reads the token from secure store', async () => {
    mockedStore.getItemAsync.mockResolvedValue('token_123');
    await expect(getAuthToken()).resolves.toBe('token_123');
    expect(mockedStore.getItemAsync).toHaveBeenCalledWith('authToken');
  });

  it('returns null when no token is stored', async () => {
    mockedStore.getItemAsync.mockResolvedValue(null);
    await expect(getAuthToken()).resolves.toBeNull();
  });

  it('persists the token, readable only on this device while unlocked', async () => {
    mockedStore.setItemAsync.mockResolvedValue();
    await setAuthToken('token_456');
    expect(mockedStore.setItemAsync).toHaveBeenCalledWith('authToken', 'token_456', {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
    });
  });

  it('clears the token', async () => {
    mockedStore.deleteItemAsync.mockResolvedValue();
    await clearAuthToken();
    expect(mockedStore.deleteItemAsync).toHaveBeenCalledWith('authToken');
  });
});

describe('patient storage', () => {
  const PATIENT = {
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
  } as const;

  it('round-trips the patient as JSON', async () => {
    mockedStore.setItemAsync.mockResolvedValue();
    await setStoredPatient(PATIENT);
    expect(mockedStore.setItemAsync).toHaveBeenCalledWith(
      'patientDetail',
      JSON.stringify(PATIENT),
      { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }
    );
    mockedStore.getItemAsync.mockResolvedValue(JSON.stringify(PATIENT));
    await expect(getStoredPatient()).resolves.toEqual(PATIENT);
  });

  it('restores a patient with no blood group, date of birth or weight', async () => {
    const sparse = { ...PATIENT, bloodGroup: null };
    mockedStore.getItemAsync.mockResolvedValue(JSON.stringify(sparse));
    await expect(getStoredPatient()).resolves.toEqual(sparse);
  });

  it.each([
    ['nothing stored', null],
    ['invalid JSON', '{'],
    ['a wrong shape', JSON.stringify({ id: 'p_001' })]
  ])('returns null for %s', async (_name, raw) => {
    mockedStore.getItemAsync.mockResolvedValue(raw);
    await expect(getStoredPatient()).resolves.toBeNull();
  });

  it('removes the patient', async () => {
    mockedStore.deleteItemAsync.mockResolvedValue();
    await clearStoredPatient();
    expect(mockedStore.deleteItemAsync).toHaveBeenCalledWith('patientDetail');
  });
});
