import type { PatientDetail } from './patient';

/** Request body for password sign-in (POST /api/auth/sign-in). */
export interface SignInRequest {
  /** Patient ID (e.g. "CW-102938") or mobile number with country code (e.g. "+919876543210"). */
  username: string;
  password: string;
}

/** API response shape for password sign-in (POST /api/auth/sign-in). */
export interface SignInResponse {
  /** Send as `Authorization: Bearer <accessToken>` on authenticated requests. */
  accessToken: string;
  patient: PatientDetail;
}
