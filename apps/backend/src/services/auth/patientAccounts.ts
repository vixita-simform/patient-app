import type { PatientBloodGroup, PatientDetail, PatientGender } from '@patient-app/shared-types';

import { query } from '../../config';

export interface PatientAccount {
  patient: PatientDetail;
  /** The `users` row that owns the login. */
  userId: string;
  /** bcrypt (`$2b$...`) or scrypt hash from the `users` table; null when no password is set. */
  passwordHash: string | null;
}

interface AccountRow {
  user_id: string;
  password_hash: string | null;
  user_mobile: string;
  user_email: string | null;
  patient_id: string;
  first_name: string;
  last_name: string | null;
  gender: PatientGender;
  blood_group: PatientBloodGroup | null;
  patient_mobile: string | null;
  patient_email: string | null;
  date_of_birth: string | null;
  weight_kg: number | null;
  uhid: string;
}

/**
 * Finds an account by patient ID (UHID, case-insensitive) or mobile number with country code.
 * The account is the login user's own ("self") patient record; inactive or deleted users
 * and deleted patients never match.
 * @param username - what the patient typed as their username.
 * @returns the account, or undefined when none matches.
 */
export async function findPatientAccount(username: string): Promise<PatientAccount | undefined> {
  const [row] = await query<AccountRow>(
    `SELECT u.id::text AS user_id,
            u.password_hash,
            u.mobile AS user_mobile,
            u.email AS user_email,
            p.id::text AS patient_id,
            p.first_name,
            p.last_name,
            p.gender::text AS gender,
            p.blood_group::text AS blood_group,
            p.mobile AS patient_mobile,
            p.email AS patient_email,
            to_char(p.date_of_birth, 'YYYY-MM-DD') AS date_of_birth,
            p.weight_kg::float8 AS weight_kg,
            p.uhid
       FROM users u
       JOIN user_patient_links l ON l.user_id = u.id AND l.relation = 'self'
       JOIN patients p ON p.id = l.patient_id
      WHERE (upper(p.uhid) = upper($1) OR u.mobile = $1)
        AND u.status = 'active'
        AND u.deleted_at IS NULL
        AND p.deleted_at IS NULL
      LIMIT 1`,
    [username.trim()]
  );
  if (!row) {
    return undefined;
  }
  return {
    userId: row.user_id,
    passwordHash: row.password_hash,
    patient: {
      id: row.patient_id,
      uhid: row.uhid,
      firstName: row.first_name,
      lastName: row.last_name ?? '',
      phone: row.patient_mobile ?? row.user_mobile,
      email: row.patient_email ?? row.user_email ?? '',
      gender: row.gender,
      bloodGroup: row.blood_group,
      weight: row.weight_kg,
      dateOfBirth: row.date_of_birth
    }
  };
}

/**
 * Records a successful sign-in on the user's row.
 * @param userId - the `users` id that signed in.
 */
export async function recordSignIn(userId: string): Promise<void> {
  await query('UPDATE users SET last_login_at = now() WHERE id = $1', [userId]);
}
