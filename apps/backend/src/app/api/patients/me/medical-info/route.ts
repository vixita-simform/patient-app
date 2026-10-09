import type {
  MedicalInfoResponse,
  PatientBloodGroup,
  PatientGender,
  UpdateMedicalInfoRequest
} from '@patient-app/shared-types';

import { badRequest, notFound } from '../../../../../lib';
import { withAuth } from '../../../../../middlewares';
import { getMedicalInfo, updateMedicalInfo } from '../../../../../services/medicalInfo';

// Per-patient data: never prerender or cache.
export const dynamic = 'force-dynamic';

/** Column sizes from the schema (patients.first_name, patient_allergies.allergen, ...). */
const MAX_NAME_LENGTH = 100;
const MAX_ITEM_LENGTH = 150;
const MAX_CONTACT_NAME_LENGTH = 150;
/** Upper bound on each list, so one request cannot insert thousands of rows. */
const MAX_LIST_ITEMS = 50;

const GENDERS: readonly PatientGender[] = ['male', 'female', 'other'];
const BLOOD_GROUPS: readonly PatientBloodGroup[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'O+',
  'O-',
  'AB+',
  'AB-'
];

const INVALID_BODY = 'Check the details and try again.';

/** A trimmed string of at most `max` characters, or null when it is not one. */
const text = (value: unknown, max: number, allowEmpty = false): string | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length <= max && (allowEmpty || trimmed.length > 0) ? trimmed : null;
};

/** Trimmed, non-empty, case-insensitively unique items; null when any item is invalid. */
const textList = (value: unknown): string[] | null => {
  if (!Array.isArray(value) || value.length > MAX_LIST_ITEMS) {
    return null;
  }
  const seen = new Set<string>();
  const items: string[] = [];
  for (const entry of value) {
    const item = text(entry, MAX_ITEM_LENGTH);
    if (item === null) {
      return null;
    }
    if (!seen.has(item.toLowerCase())) {
      seen.add(item.toLowerCase());
      items.push(item);
    }
  }
  return items;
};

/** A real "YYYY-MM-DD" calendar date that is not in the future. */
const isBirthDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().startsWith(value) &&
    date.getUTCFullYear() >= 1900 &&
    date.getTime() <= Date.now()
  );
};

const parseBody = async (request: Request): Promise<UpdateMedicalInfoRequest | null> => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return null;
  }
  if (typeof body !== 'object' || body === null) {
    return null;
  }
  const fields = body as Record<string, unknown>;
  const firstName = text(fields.firstName, MAX_NAME_LENGTH);
  const lastName = text(fields.lastName ?? '', MAX_NAME_LENGTH, true);
  const dateOfBirth = text(fields.dateOfBirth, 10);
  const gender = GENDERS.find((option) => option === fields.gender);
  const bloodGroup =
    fields.bloodGroup === null ? null : BLOOD_GROUPS.find((option) => option === fields.bloodGroup);
  const allergies = textList(fields.allergies);
  const conditions = textList(fields.conditions);
  const emergencyContactName =
    fields.emergencyContactName == null
      ? null
      : text(fields.emergencyContactName, MAX_CONTACT_NAME_LENGTH);

  if (
    firstName === null ||
    lastName === null ||
    dateOfBirth === null ||
    !isBirthDate(dateOfBirth) ||
    !gender ||
    bloodGroup === undefined ||
    !allergies ||
    !conditions ||
    (fields.emergencyContactName != null && emergencyContactName === null)
  ) {
    return null;
  }
  return {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    bloodGroup,
    allergies,
    conditions,
    emergencyContactName
  };
};

export const GET = withAuth(
  'GET /api/patients/me/medical-info',
  async (_request, { patientId }) => {
    const body: MedicalInfoResponse | null = await getMedicalInfo(patientId);
    return body ? Response.json(body) : notFound('Patient not found.');
  }
);

export const PUT = withAuth('PUT /api/patients/me/medical-info', async (request, { patientId }) => {
  const input = await parseBody(request);
  if (!input) {
    return badRequest(INVALID_BODY);
  }
  const body: MedicalInfoResponse | null = await updateMedicalInfo(patientId, input);
  return body ? Response.json(body) : notFound('Patient not found.');
});
