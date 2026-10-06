import { createHmac, timingSafeEqual } from "node:crypto";

import { env } from "./env";

/** Patient ids are short opaque strings such as "p_001". */
const PATIENT_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

const sign = (patientId: string): string =>
  createHmac("sha256", env.authTokenSecret).update(patientId).digest("base64url");

/**
 * Issues an access token for a patient: `<patientId>.<HMAC-SHA256 signature>`.
 * Stand-in until a real identity provider (OTP service) issues tokens.
 * @param patientId - the patient the token is for.
 * @returns the signed token.
 */
export function issueAccessToken(patientId: string): string {
  if (!PATIENT_ID_PATTERN.test(patientId)) {
    throw new Error("Invalid patient id");
  }
  return `${patientId}.${sign(patientId)}`;
}

/**
 * Verifies a token and returns the patient id it was issued for.
 * @param token - the token from the Authorization header.
 * @returns the patient id, or null when the token is malformed or the signature is wrong.
 */
export function verifyAccessToken(token: string): string | null {
  const separator = token.lastIndexOf(".");
  if (separator <= 0) {
    return null;
  }
  const patientId = token.slice(0, separator);
  if (!PATIENT_ID_PATTERN.test(patientId)) {
    return null;
  }
  const given = Buffer.from(token.slice(separator + 1));
  const expected = Buffer.from(sign(patientId));
  return given.length === expected.length && timingSafeEqual(given, expected) ? patientId : null;
}

/**
 * Reads the signed-in patient from `Authorization: Bearer <token>`.
 * @param request - the incoming request.
 * @returns the verified patient id, or null when the caller is not signed in.
 */
export function getAuthenticatedPatientId(request: Request): string | null {
  const header = request.headers.get("authorization");
  const match = header?.match(/^Bearer (\S+)$/);
  return match ? verifyAccessToken(match[1]) : null;
}
