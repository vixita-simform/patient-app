import type { ApiErrorResponse } from '@patient-app/shared-types';

/** HTTP status codes the API returns on failure. */
export const HTTP_STATUS = {
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  tooManyRequests: 429,
  internalError: 500
} as const;

/** Stable error codes the apps can branch on. */
export const ERROR_CODE = {
  invalidRequest: 'invalid_request',
  invalidCredentials: 'invalid_credentials',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  notFound: 'not_found',
  tooManyRequests: 'too_many_requests',
  internalError: 'internal_error'
} as const;

/**
 * Builds a response in the shared error shape.
 * @param status - HTTP status code.
 * @param code - stable machine-readable error code.
 * @param message - message safe to show to the user.
 * @returns the JSON error response.
 */
export function errorResponse(status: number, code: string, message: string): Response {
  const body: ApiErrorResponse = { error: { code, message } };
  return Response.json(body, { status });
}

export const badRequest = (message: string): Response =>
  errorResponse(HTTP_STATUS.badRequest, ERROR_CODE.invalidRequest, message);

export const unauthorized = (
  message = 'Please sign in again.',
  code: string = ERROR_CODE.unauthorized
): Response => errorResponse(HTTP_STATUS.unauthorized, code, message);

export const forbidden = (message = 'You do not have access to this.'): Response =>
  errorResponse(HTTP_STATUS.forbidden, ERROR_CODE.forbidden, message);

export const notFound = (message = 'This API endpoint does not exist.'): Response =>
  errorResponse(HTTP_STATUS.notFound, ERROR_CODE.notFound, message);

export const tooManyRequests = (message = 'Too many attempts. Please try again later.'): Response =>
  errorResponse(HTTP_STATUS.tooManyRequests, ERROR_CODE.tooManyRequests, message);

/**
 * Logs an unexpected error on the server and returns a generic 500 without internals.
 * @param context - where it happened, for the log (never patient data).
 * @param error - the caught error.
 * @returns the generic 500 response.
 */
export function internalError(context: string, error: unknown): Response {
  console.error(`[${context}]`, error instanceof Error ? error.message : error);
  return errorResponse(
    HTTP_STATUS.internalError,
    ERROR_CODE.internalError,
    'Something went wrong. Please try again.'
  );
}
