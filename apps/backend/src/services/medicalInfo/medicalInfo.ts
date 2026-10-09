import type {
  MedicalInfoResponse,
  PatientAllergy,
  PatientBloodGroup,
  PatientCondition,
  PatientEmergencyContact,
  PatientGender,
  UpdateMedicalInfoRequest
} from '@patient-app/shared-types';

import { query, type TransactionQuery, withTransaction } from '../../config';

/** Database ids are bigints; anything else cannot be a patient. */
const PATIENT_ID_PATTERN = /^\d{1,18}$/;

/** The contact the app shows: the one marked primary, else the first in the patient's order. */
const PRIMARY_CONTACT_ORDER = 'ORDER BY is_primary DESC, sort_order, id LIMIT 1';

interface PatientRow {
  id: string;
  uhid: string;
  first_name: string;
  last_name: string | null;
  gender: PatientGender;
  blood_group: PatientBloodGroup | null;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  weight_kg: number | null;
}

interface AllergyRow {
  id: string;
  allergen: string;
}

interface ConditionRow {
  id: string;
  condition_name: string;
}

interface ContactRow {
  id: string;
  name: string;
  relation: string;
  mobile: string;
}

const readMedicalInfo = async (
  run: TransactionQuery,
  patientId: string
): Promise<MedicalInfoResponse | null> => {
  // Phone and email fall back to the login account that owns this patient as "self".
  const [patient] = await run<PatientRow>(
    `SELECT p.id::text,
            p.uhid,
            p.first_name,
            p.last_name,
            p.gender::text AS gender,
            p.blood_group::text AS blood_group,
            COALESCE(p.mobile, u.mobile) AS phone,
            COALESCE(p.email, u.email) AS email,
            to_char(p.date_of_birth, 'YYYY-MM-DD') AS date_of_birth,
            p.weight_kg::float8 AS weight_kg
       FROM patients p
       LEFT JOIN user_patient_links l ON l.patient_id = p.id AND l.relation = 'self'
       LEFT JOIN users u ON u.id = l.user_id
      WHERE p.id = $1 AND p.deleted_at IS NULL
      LIMIT 1`,
    [patientId]
  );
  if (!patient) {
    return null;
  }
  const [allergies, conditions, [contact]] = await Promise.all([
    run<AllergyRow>(
      `SELECT id::text, allergen FROM patient_allergies WHERE patient_id = $1 ORDER BY created_at, id`,
      [patientId]
    ),
    run<ConditionRow>(
      `SELECT id::text, condition_name
         FROM patient_conditions
        WHERE patient_id = $1 AND status = 'active'
        ORDER BY created_at, id`,
      [patientId]
    ),
    run<ContactRow>(
      `SELECT id::text, name, relation, mobile
         FROM patient_emergency_contacts
        WHERE patient_id = $1
        ${PRIMARY_CONTACT_ORDER}`,
      [patientId]
    )
  ]);

  const emergencyContact: PatientEmergencyContact | null = contact
    ? { id: contact.id, name: contact.name, relation: contact.relation, phone: contact.mobile }
    : null;

  return {
    patient: {
      id: patient.id,
      uhid: patient.uhid,
      firstName: patient.first_name,
      lastName: patient.last_name ?? '',
      phone: patient.phone ?? '',
      email: patient.email ?? '',
      gender: patient.gender,
      bloodGroup: patient.blood_group,
      dateOfBirth: patient.date_of_birth,
      weight: patient.weight_kg
    },
    allergies: allergies.map((row): PatientAllergy => ({ id: row.id, allergen: row.allergen })),
    conditions: conditions.map((row): PatientCondition => ({
      id: row.id,
      name: row.condition_name
    })),
    emergencyContact
  };
};

/**
 * Loads a patient's personal and medical info: identity, allergies, active conditions and
 * the primary emergency contact.
 * @param patientId - the verified, signed-in patient's database id.
 * @returns the medical info, or null when no such patient exists.
 */
export async function getMedicalInfo(patientId: string): Promise<MedicalInfoResponse | null> {
  if (!PATIENT_ID_PATTERN.test(patientId)) {
    return null;
  }
  return readMedicalInfo(query, patientId);
}

/**
 * Saves the medical info form in one transaction. Allergies missing from the list are
 * deleted; active conditions missing from it are marked resolved (kept as history).
 * @param patientId - the verified, signed-in patient's database id.
 * @param input - the validated form; allergy and condition lists must already be de-duplicated.
 * @returns the saved medical info, or null when no such patient exists.
 */
export async function updateMedicalInfo(
  patientId: string,
  input: UpdateMedicalInfoRequest
): Promise<MedicalInfoResponse | null> {
  if (!PATIENT_ID_PATTERN.test(patientId)) {
    return null;
  }
  return withTransaction(async (run) => {
    const updated = await run(
      `UPDATE patients
          SET first_name = $2, last_name = NULLIF($3, ''), date_of_birth = $4,
              gender = $5::gender, blood_group = $6::blood_group
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING id`,
      [
        patientId,
        input.firstName,
        input.lastName,
        input.dateOfBirth,
        input.gender,
        input.bloodGroup
      ]
    );
    if (updated.length === 0) {
      return null;
    }

    await run(
      `DELETE FROM patient_allergies WHERE patient_id = $1 AND NOT (allergen = ANY($2::text[]))`,
      [patientId, input.allergies]
    );
    await run(
      `INSERT INTO patient_allergies (patient_id, allergen)
       SELECT $1, allergen FROM unnest($2::text[]) AS allergen
       ON CONFLICT (patient_id, allergen) DO NOTHING`,
      [patientId, input.allergies]
    );

    const conditionKeys = input.conditions.map((name) => name.toLowerCase());
    await run(
      `UPDATE patient_conditions SET status = 'resolved'
        WHERE patient_id = $1 AND status = 'active'
          AND NOT (lower(condition_name) = ANY($2::text[]))`,
      [patientId, conditionKeys]
    );
    await run(
      `INSERT INTO patient_conditions (patient_id, condition_name)
       SELECT $1, name FROM unnest($2::text[]) AS name
        WHERE NOT EXISTS (
          SELECT 1 FROM patient_conditions c
           WHERE c.patient_id = $1 AND c.status = 'active'
             AND lower(c.condition_name) = lower(name))`,
      [patientId, input.conditions]
    );

    if (input.emergencyContactName !== null) {
      await run(
        `UPDATE patient_emergency_contacts SET name = $2
          WHERE id = (SELECT id FROM patient_emergency_contacts
                       WHERE patient_id = $1
                       ${PRIMARY_CONTACT_ORDER})`,
        [patientId, input.emergencyContactName]
      );
    }

    return readMedicalInfo(run, patientId);
  });
}
