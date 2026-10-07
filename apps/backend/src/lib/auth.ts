import { createHmac, timingSafeEqual } from 'node:crypto';

import { env } from './env';

/** Patient ids are opaque strings of letters, digits, `_` and `-` (database ids are numeric). */
const PATIENT_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

/** How long an access token stays valid. */
export const ACCESS_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

const sign = (payload: string): string =>
  createHmac('sha256', env.authTokenSecret).update(payload).digest('base64url');

/**
 * Issues an access token for a patient: `<patientId>.<expiry>.<HMAC-SHA256 signature>`.
 * Stand-in until a real identity provider (OTP service) issues tokens.
 * @param patientId - the patient the token is for.
 * @param now - current time in ms, overridable for tests.
 * @returns the signed token.
 */
export function issueAccessToken(patientId: string, now: number = Date.now()): string {
  if (!PATIENT_ID_PATTERN.test(patientId)) {
    throw new Error('Invalid patient id');
  }
  const payload = `${patientId}.${Math.floor(now / 1000) + ACCESS_TOKEN_TTL_SECONDS}`;
  return `${payload}.${sign(payload)}`;
}

/**
 * Verifies a token and returns the patient id it was issued for.
 * @param token - the token from the Authorization header.
 * @param now - current time in ms, overridable for tests.
 * @returns the patient id, or null when the token is malformed, expired or badly signed.
 */
export function verifyAccessToken(token: string, now: number = Date.now()): string | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }
  const [patientId, expiry, signature] = parts;
  if (!PATIENT_ID_PATTERN.test(patientId) || !/^\d{1,12}$/.test(expiry)) {
    return null;
  }
  const given = Buffer.from(signature);
  const expected = Buffer.from(sign(`${patientId}.${expiry}`));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return null;
  }
  return Number(expiry) * 1000 > now ? patientId : null;
}

/**
 * Reads the signed-in patient from `Authorization: Bearer <token>`.
 * @param request - the incoming request.
 * @returns the verified patient id, or null when the caller is not signed in.
 */
export function getAuthenticatedPatientId(request: Request): string | null {
  const header = request.headers.get('authorization');
  const match = header?.match(/^Bearer (\S+)$/);
  return match ? verifyAccessToken(match[1]) : null;
}
