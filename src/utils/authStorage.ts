import * as SecureStore from "expo-secure-store";

const AUTH_TOKEN_KEY = "authToken";

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
export const setAuthToken = (token: string): Promise<void> => SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);

/**
 * Removes the persisted auth token (sign out).
 * @returns {Promise<void>}
 */
export const clearAuthToken = (): Promise<void> => SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
