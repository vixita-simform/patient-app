import type { HomeDashboardResponse } from '@patient-app/shared-types';

import { API_ENDPOINTS } from '../constants';
import { apiRequest } from './apiClient';

/**
 * Loads the signed-in patient's Home dashboard.
 * @param {string} token - The access token issued on sign in.
 * @returns {Promise<HomeDashboardResponse>} Patient, OPD token, next appointment and vitals.
 */
export const getHomeDashboard = (token: string): Promise<HomeDashboardResponse> =>
  apiRequest<HomeDashboardResponse>(API_ENDPOINTS.dashboard, { token });
