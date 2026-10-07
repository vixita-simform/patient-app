import type { SignInResponse } from '@patient-app/shared-types';

import { issueAccessToken } from '../../lib';
import { verifyPassword } from './password';
import { findPatientAccount, recordSignIn } from './patientAccounts';

/** Checked when no real hash exists, so unknown accounts take as long as wrong passwords. */
const DECOY_HASH =
  'AAAAAAAAAAAAAAAAAAAAAA:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

/**
 * Checks a patient's username and password and issues an access token.
 * An unknown username, an account with no password (OTP-only) and a wrong password all
 * give the same result, so the response cannot be used to find which accounts exist.
 * @param username - patient ID or mobile number with country code.
 * @param password - the plain-text password.
 * @returns the token and patient, or null when the credentials are wrong.
 */
export async function signInWithPassword(
  username: string,
  password: string
): Promise<SignInResponse | null> {
  const account = await findPatientAccount(username);
  const isMatch = await verifyPassword(password, account?.passwordHash ?? DECOY_HASH);
  if (!account || !account.passwordHash || !isMatch) {
    return null;
  }
  await recordSignIn(account.userId);
  return {
    accessToken: issueAccessToken(account.patient.id),
    patient: account.patient
  };
}
