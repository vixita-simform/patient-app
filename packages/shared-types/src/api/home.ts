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

export interface Vitals {
  heartRate: VitalReading;
  bloodPressure: BloodPressureReading;
  bloodSugar: VitalReading;
  /** ISO 8601 date-time */
  recordedAt: string;
}

/** API response shape for the Home dashboard (GET /patients/me/dashboard). */
export interface HomeDashboardResponse {
  patient: PatientSummary;
  opdToken: OpdToken;
  nextAppointment: NextAppointment | null;
  vitals: Vitals;
}
