import type { MedicalInfoResponse, UpdateMedicalInfoRequest } from '@patient-app/shared-types';

import { API_ENDPOINTS } from '../constants';
import { apiRequest } from './apiClient';

/**
 * Loads the signed-in patient's personal and medical info.
 * @param {string} token - The access token issued on sign in.
 * @returns {Promise<MedicalInfoResponse>} Patient, allergies, active conditions and emergency contact.
 */
export const getMedicalInfo = (token: string): Promise<MedicalInfoResponse> =>
  apiRequest<MedicalInfoResponse>(API_ENDPOINTS.medicalInfo, { token });

/**
 * Saves the personal and medical info form.
 * @param {string} token - The access token issued on sign in.
 * @param {UpdateMedicalInfoRequest} body - The whole form; missing allergies and conditions are removed.
 * @returns {Promise<MedicalInfoResponse>} The saved medical info.
 */
export const updateMedicalInfo = (
  token: string,
  body: UpdateMedicalInfoRequest
): Promise<MedicalInfoResponse> =>
  apiRequest<MedicalInfoResponse>(API_ENDPOINTS.medicalInfo, { method: 'PUT', token, body });
