import type { SignInRequest, SignInResponse } from '@patient-app/shared-types';

import { API_ENDPOINTS } from '../constants';
import { apiRequest } from './apiClient';

/**
 * Signs in with a username (patient ID or mobile number with country code) and password.
 * @param {SignInRequest} credentials - Username and password.
 * @returns {Promise<SignInResponse>} The access token and the signed-in patient.
 */
export const signInWithPassword = (credentials: SignInRequest): Promise<SignInResponse> =>
  apiRequest<SignInResponse>(API_ENDPOINTS.signIn, { method: 'POST', body: credentials });
