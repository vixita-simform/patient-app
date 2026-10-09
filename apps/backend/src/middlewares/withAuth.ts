import { getAuthenticatedPatientId, internalError, unauthorized } from '../lib';

/** What `withAuth` hands a route handler once the caller is verified. */
export interface AuthContext {
  /** The signed-in patient's id, taken from a verified access token. */
  patientId: string;
}

export type AuthenticatedHandler = (request: Request, auth: AuthContext) => Promise<Response>;

/**
 * Route middleware for endpoints that need a signed-in patient. Reads
 * `Authorization: Bearer <token>`, answers 401 when it is missing, malformed, expired or
 * badly signed, and otherwise runs `handler` with the verified patient id. Anything the
 * handler (or token check) throws becomes a generic 500, so handlers need no try/catch.
 * @param name - the endpoint, e.g. "GET /api/patients/me/dashboard", used in error logs.
 * @param handler - the route logic for a verified patient.
 * @returns a Next.js route handler.
 */
export function withAuth(
  name: string,
  handler: AuthenticatedHandler
): (request: Request) => Promise<Response> {
  return async (request) => {
    try {
      const patientId = getAuthenticatedPatientId(request);
      if (!patientId) {
        return unauthorized();
      }
      return await handler(request, { patientId });
    } catch (error) {
      return internalError(name, error);
    }
  };
}
