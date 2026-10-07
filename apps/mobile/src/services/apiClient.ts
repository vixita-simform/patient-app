import type { ApiErrorResponse } from '@patient-app/shared-types';

import { HTTP_STATUS } from '../constants';
import { getApiBaseUrl } from './apiConfig';

/** A failed API call: the HTTP status, or `HTTP_STATUS.networkError` (0) when no response came back. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Sent as `Authorization: Bearer <token>`. */
  token?: string;
}

const isApiErrorResponse = (value: unknown): value is ApiErrorResponse =>
  typeof (value as ApiErrorResponse | null)?.error?.message === 'string';

/**
 * Calls the backend and parses its JSON response.
 * @param {string} path - Endpoint path, e.g. "/api/auth/sign-in".
 * @param {ApiRequestOptions} options - Method, JSON body and auth token.
 * @returns {Promise<T>} The parsed response body.
 * @throws {ApiError} On a network failure or a non-2xx response.
 */
export const apiRequest = async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new ApiError(HTTP_STATUS.networkError, 'API URL is not configured');
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });
  } catch {
    throw new ApiError(HTTP_STATUS.networkError, 'Network request failed');
  }

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw isApiErrorResponse(data)
      ? new ApiError(response.status, data.error.message)
      : new ApiError(response.status, `Request failed with ${response.status}`);
  }
  return data as T;
};
