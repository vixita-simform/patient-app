export interface PatientSummary {
  id: string;
  firstName: string;
  lastName: string;
}

export interface OpdToken {
  tokenNumber: string;
  department: string;
  nowServing: string;
  patientsAhead: number;
  estimatedWaitMinutes: number;
  /** Queue progress, 0 to 1 */
  queueProgress: number;
}

export interface AppointmentDoctor {
  id: string;
  name: string;
  specialty: string;
}

export interface NextAppointment {
  id: string;
  doctor: AppointmentDoctor;
  room: string;
  /** ISO 8601 date-time */
  scheduledAt: string;
}

export interface VitalReading {
  value: number;
  unit: string;
}

export interface BloodPressureReading {
  systolic: number;
  diastolic: number;
  unit: string;
}

/** Latest reading of each vital; null when the patient has none recorded. */
export interface Vitals {
  heartRate: VitalReading | null;
  bloodPressure: BloodPressureReading | null;
  bloodSugar: VitalReading | null;
  /** ISO 8601 date-time of the newest reading; null when there are none. */
  recordedAt: string | null;
}

/** API response shape for the Home dashboard (GET /patients/me/dashboard). */
export interface HomeDashboardResponse {
  patient: PatientSummary;
  /** Today's OPD queue token; null when the patient has none. */
  opdToken: OpdToken | null;
  nextAppointment: NextAppointment | null;
  vitals: Vitals;
}
