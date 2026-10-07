import type { AppointmentStatus, AppointmentTab, VisitMode } from '../../constants';

/** One appointment row as rendered on My Appointments. */
export interface AppointmentSummary {
  id: string;
  /** Doctor id from `findADoctorDummyData.doctors`, so a card tap resolves a real profile. */
  doctorId: string;
  initials: string;
  doctorName: string;
  specialtyLabel: string;
  visitMode: VisitMode;
  status: AppointmentStatus;
  /** ISO 8601 date-time */
  scheduledAt: string;
}

/** API response shape for My Appointments (GET /patients/me/appointments), grouped by tab. */
export type AppointmentListResponse = Record<AppointmentTab, readonly AppointmentSummary[]>;
