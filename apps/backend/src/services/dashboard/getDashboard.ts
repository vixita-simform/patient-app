import type {
  HomeDashboardResponse,
  NextAppointment,
  OpdToken,
  PatientSummary,
  Vitals
} from '@patient-app/shared-types';

import { query } from '../../config';

/** Hospital time zone: appointment dates/times and the OPD queue day are stored without one. */
const HOSPITAL_TIME_ZONE = 'Asia/Kolkata';
const HOSPITAL_UTC_OFFSET = '+05:30';

/** Database ids are bigints; anything else cannot be a patient. */
const PATIENT_ID_PATTERN = /^\d{1,18}$/;

interface PatientRow {
  id: string;
  first_name: string;
  last_name: string | null;
}

interface AppointmentRow {
  id: string;
  doctor_id: string;
  doctor_name: string;
  specialization: string;
  room_no: string | null;
  scheduled_at: string;
}

interface QueueRow {
  token_label: string;
  token_number: number;
  department: string;
  token_prefix: string;
  now_serving_number: number;
  avg_consult_minutes: number;
  patients_ahead: number;
}

interface VitalRow {
  vital_type: 'blood_pressure' | 'heart_rate' | 'blood_sugar';
  value_primary: string;
  value_secondary: string | null;
  unit: string;
  recorded_at: Date;
}

const findPatient = async (patientId: string): Promise<PatientSummary | null> => {
  const [row] = await query<PatientRow>(
    `SELECT id::text, first_name, last_name
       FROM patients
      WHERE id = $1 AND deleted_at IS NULL`,
    [patientId]
  );
  return row ? { id: row.id, firstName: row.first_name, lastName: row.last_name ?? '' } : null;
};

const findNextAppointment = async (patientId: string): Promise<NextAppointment | null> => {
  const [row] = await query<AppointmentRow>(
    `SELECT a.id::text,
            d.id::text AS doctor_id,
            d.title || ' ' || d.first_name || ' ' || d.last_name AS doctor_name,
            d.specialization,
            r.room_no,
            to_char(a.appointment_date, 'YYYY-MM-DD') || 'T' ||
              to_char(a.start_time, 'HH24:MI:SS') || '${HOSPITAL_UTC_OFFSET}' AS scheduled_at
       FROM appointments a
       JOIN doctors d ON d.id = a.doctor_id
       LEFT JOIN rooms r ON r.id = COALESCE(a.room_id, d.default_room_id)
      WHERE a.patient_id = $1
        AND a.status IN ('pending', 'confirmed', 'checked_in', 'in_consultation')
        AND (a.appointment_date + a.start_time) >= (now() AT TIME ZONE '${HOSPITAL_TIME_ZONE}')
      ORDER BY a.appointment_date, a.start_time
      LIMIT 1`,
    [patientId]
  );
  return row
    ? {
        id: row.id,
        doctor: { id: row.doctor_id, name: row.doctor_name, specialty: row.specialization },
        room: row.room_no ?? '',
        scheduledAt: row.scheduled_at
      }
    : null;
};

const findOpdToken = async (patientId: string): Promise<OpdToken | null> => {
  const [row] = await query<QueueRow>(
    `SELECT t.token_label,
            t.token_number,
            dep.name AS department,
            c.token_prefix,
            c.now_serving_number,
            c.avg_consult_minutes,
            (SELECT count(*)::int
               FROM opd_queue_tokens ahead
              WHERE ahead.queue_counter_id = t.queue_counter_id
                AND ahead.token_number < t.token_number
                AND ahead.status = 'waiting') AS patients_ahead
       FROM opd_queue_tokens t
       JOIN appointments a ON a.id = t.appointment_id
       JOIN opd_queue_counters c ON c.id = t.queue_counter_id
       JOIN departments dep ON dep.id = a.department_id
      WHERE a.patient_id = $1
        AND c.queue_date = (now() AT TIME ZONE '${HOSPITAL_TIME_ZONE}')::date
        AND t.status IN ('waiting', 'called', 'in_consultation')
      ORDER BY t.issued_at DESC
      LIMIT 1`,
    [patientId]
  );
  if (!row) {
    return null;
  }
  return {
    tokenNumber: row.token_label,
    department: row.department,
    nowServing: `${row.token_prefix}-${row.now_serving_number}`,
    patientsAhead: row.patients_ahead,
    estimatedWaitMinutes: row.patients_ahead * row.avg_consult_minutes,
    queueProgress: row.token_number > 0 ? Math.min(1, row.now_serving_number / row.token_number) : 0
  };
};

const findLatestVitals = async (patientId: string): Promise<Vitals> => {
  const rows = await query<VitalRow>(
    `SELECT DISTINCT ON (vital_type) vital_type, value_primary, value_secondary, unit, recorded_at
       FROM vitals
      WHERE patient_id = $1 AND vital_type IN ('heart_rate', 'blood_pressure', 'blood_sugar')
      ORDER BY vital_type, recorded_at DESC`,
    [patientId]
  );
  const latest = (type: VitalRow['vital_type']): VitalRow | undefined =>
    rows.find((row) => row.vital_type === type);

  const heart = latest('heart_rate');
  const pressure = latest('blood_pressure');
  const sugar = latest('blood_sugar');
  const newest = rows.reduce<Date | null>(
    (acc, row) => (!acc || row.recorded_at > acc ? row.recorded_at : acc),
    null
  );

  return {
    heartRate: heart ? { value: Number(heart.value_primary), unit: heart.unit } : null,
    bloodPressure:
      pressure && pressure.value_secondary !== null
        ? {
            systolic: Number(pressure.value_primary),
            diastolic: Number(pressure.value_secondary),
            unit: pressure.unit
          }
        : null,
    bloodSugar: sugar ? { value: Number(sugar.value_primary), unit: sugar.unit } : null,
    recordedAt: newest ? newest.toISOString() : null
  };
};

/**
 * Builds the Home dashboard for one patient from the database.
 * @param patientId - the verified, signed-in patient's database id.
 * @returns the dashboard, or null when no such patient exists.
 */
export async function getDashboard(patientId: string): Promise<HomeDashboardResponse | null> {
  if (!PATIENT_ID_PATTERN.test(patientId)) {
    return null;
  }
  const patient = await findPatient(patientId);
  if (!patient) {
    return null;
  }
  const [opdToken, nextAppointment, vitals] = await Promise.all([
    findOpdToken(patientId),
    findNextAppointment(patientId),
    findLatestVitals(patientId)
  ]);
  return { patient, opdToken, nextAppointment, vitals };
}
