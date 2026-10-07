import type { SignInRequest, SignInResponse } from '@patient-app/shared-types';

import {
  allowAttempt,
  badRequest,
  ERROR_CODE,
  internalError,
  tooManyRequests,
  unauthorized
} from '../../../../lib';
import { signInWithPassword } from '../../../../services/auth';

/** Upper bound on each field, so a huge password cannot tie up scrypt. */
const MAX_FIELD_LENGTH = 128;

/** Sign-in attempts allowed per client and username in each window. */
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

const isField = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= MAX_FIELD_LENGTH;

const parseBody = async (request: Request): Promise<SignInRequest | null> => {
  try {
    const body: unknown = await request.json();
    if (typeof body !== 'object' || body === null) {
      return null;
    }
    const { username, password } = body as Record<string, unknown>;
    return isField(username) && isField(password) ? { username, password } : null;
  } catch {
    return null;
  }
};

const clientAddress = (request: Request): string =>
  request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';

export async function POST(request: Request): Promise<Response> {
  try {
    const credentials = await parseBody(request);
    if (!credentials) {
      return badRequest('Enter your username and password.');
    }
    const key = `sign-in:${clientAddress(request)}:${credentials.username.trim().toLowerCase()}`;
    if (!allowAttempt(key, MAX_ATTEMPTS, ATTEMPT_WINDOW_MS)) {
      return tooManyRequests();
    }
    const body: SignInResponse | null = await signInWithPassword(
      credentials.username,
      credentials.password
    );
    if (!body) {
      return unauthorized('Incorrect username or password.', ERROR_CODE.invalidCredentials);
    }
    return Response.json(body);
  } catch (error) {
    return internalError('POST /api/auth/sign-in', error);
  }
}
