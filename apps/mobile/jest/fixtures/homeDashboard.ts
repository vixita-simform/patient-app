import type { HomeDashboardResponse } from '@patient-app/shared-types';

/** A full dashboard response, as GET /api/patients/me/dashboard returns it. */
export const homeDashboardFixture: HomeDashboardResponse = {
  patient: { id: 'p_001', firstName: 'Aarav', lastName: 'Sharma' },
  opdToken: {
    tokenNumber: 'A-24',
    department: 'Cardiology',
    nowServing: 'A-18',
    patientsAhead: 6,
    estimatedWaitMinutes: 25,
    queueProgress: 0.72
  },
  nextAppointment: {
    id: 'apt_5531',
    doctor: { id: 'doc_204', name: 'Dr. Rohan Mehta', specialty: 'Cardiologist' },
    room: 'Room 204',
    scheduledAt: '2026-09-29T11:30:00+05:30'
  },
  vitals: {
    heartRate: { value: 78, unit: 'bpm' },
    bloodPressure: { systolic: 122, diastolic: 80, unit: 'mmHg' },
    bloodSugar: { value: 96, unit: 'mg/dL' },
    recordedAt: '2026-09-28T08:15:00+05:30'
  }
};
