import * as SecureStore from "expo-secure-store";

const AUTH_TOKEN_KEY = "authToken";

// Readable only while the device is unlocked, and never restored to another device from a backup.
const WRITE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
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
export const setAuthToken = (token: string): Promise<void> => SecureStore.setItemAsync(AUTH_TOKEN_KEY, token, WRITE_OPTIONS);

/**
 * Removes the persisted auth token (sign out).
 * @returns {Promise<void>}
 */
export const clearAuthToken = (): Promise<void> => SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
