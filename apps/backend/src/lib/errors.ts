import type { ApiErrorResponse } from "@patient-app/shared-types";

/**
 * Builds a response in the shared error shape.
 * @param status - HTTP status code.
 * @param code - stable error code the apps can branch on.
 * @param message - message safe to show to the user.
 * @returns the JSON error response.
 */
export function errorResponse(status: number, code: string, message: string): Response {
  const body: ApiErrorResponse = { error: { code, message } };
  return Response.json(body, { status });
}

export const unauthorized = (): Response =>
  errorResponse(401, "UNAUTHORIZED", "Please sign in again.");

/**
 * Logs an unexpected error on the server and returns a generic 500 without internals.
 * @param context - where it happened, for the log (never patient data).
 * @param error - the caught error.
 * @returns the generic 500 response.
 */
export function internalError(context: string, error: unknown): Response {
  console.error(`[${context}]`, error instanceof Error ? error.message : error);
  return errorResponse(500, "INTERNAL_ERROR", "Something went wrong. Please try again.");
}
