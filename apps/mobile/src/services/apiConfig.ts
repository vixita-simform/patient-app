import Constants from 'expo-constants';

import { API_CONFIG } from '../constants';

/**
 * Base URL of the backend. `EXPO_PUBLIC_API_URL` wins; in development it falls back to the
 * machine running Metro on the dev server port, so simulators and devices on the same
 * network reach `npm run backend` without extra setup.
 * @returns {string | undefined} The base URL without a trailing slash, or undefined when not configured.
 */
export const getApiBaseUrl = (): string | undefined => {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured) {
    // Passwords and tokens must never travel over plain HTTP outside development.
    if (!__DEV__ && !configured.startsWith('https://')) {
      return undefined;
    }
    return configured.replace(/\/+$/, '');
  }

  const host = __DEV__ ? Constants.expoConfig?.hostUri?.split(':')[0] : undefined;
  return host ? `http://${host}:${API_CONFIG.devServerPort}` : undefined;
};
