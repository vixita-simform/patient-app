import type { PatientDetail } from '@patient-app/shared-types';
import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'authToken';

// Readable only while the device is unlocked, and never restored to another device from a backup.
const WRITE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
};

/**
 * Reads the persisted auth token.
 * @returns {Promise<string | null>} The token, or null when signed out.
 */
export const getAuthToken = (): Promise<string | null> => SecureStore.getItemAsync(AUTH_TOKEN_KEY);

/**
 * Persists the auth token.
 * @param {string} token - Token issued on sign in.
 * @returns {Promise<void>}
 */
export const setAuthToken = (token: string): Promise<void> =>
  SecureStore.setItemAsync(AUTH_TOKEN_KEY, token, WRITE_OPTIONS);

/**
 * Removes the persisted auth token (sign out).
 * @returns {Promise<void>}
 */
export const clearAuthToken = (): Promise<void> => SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);

const PATIENT_KEY = 'patientDetail';

/**
 * Type guard for a stored patient: checks every field the app reads, so a stale or
 * corrupted entry is treated as missing instead of crashing a screen.
 * @param {unknown} value - Parsed JSON from secure storage.
 * @returns {boolean} Whether the value has the PatientDetail shape.
 */
const isPatientDetail = (value: unknown): value is PatientDetail => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const patient = value as Record<keyof PatientDetail, unknown>;
  return (
    typeof patient.id === 'string' &&
    typeof patient.uhid === 'string' &&
    typeof patient.firstName === 'string' &&
    typeof patient.lastName === 'string' &&
    typeof patient.phone === 'string' &&
    typeof patient.email === 'string' &&
    typeof patient.gender === 'string' &&
    (patient.bloodGroup === null || typeof patient.bloodGroup === 'string') &&
    (patient.dateOfBirth === null || typeof patient.dateOfBirth === 'string') &&
    (patient.weight === null || typeof patient.weight === 'number')
  );
};

/**
 * Reads the persisted patient detail.
 * @returns {Promise<PatientDetail | null>} The patient, or null when none is stored or it is unreadable.
 */
export const getStoredPatient = async (): Promise<PatientDetail | null> => {
  const raw = await SecureStore.getItemAsync(PATIENT_KEY);
  if (raw === null) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return isPatientDetail(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * Persists the patient detail returned on sign in.
 * @param {PatientDetail} patient - The signed-in patient.
 * @returns {Promise<void>}
 */
export const setStoredPatient = (patient: PatientDetail): Promise<void> =>
  SecureStore.setItemAsync(PATIENT_KEY, JSON.stringify(patient), WRITE_OPTIONS);

/**
 * Removes the persisted patient detail (sign out).
 * @returns {Promise<void>}
 */
export const clearStoredPatient = (): Promise<void> => SecureStore.deleteItemAsync(PATIENT_KEY);
