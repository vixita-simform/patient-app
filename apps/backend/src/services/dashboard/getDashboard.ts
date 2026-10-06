import type { HomeDashboardResponse } from "@patient-app/shared-types";

/**
 * Builds the Home dashboard for one patient.
 * Placeholder data until the database layer exists; only the patient id is real.
 * @param patientId - the verified, signed-in patient.
 * @returns the dashboard for that patient.
 */
export async function getDashboard(patientId: string): Promise<HomeDashboardResponse> {
  return {
    patient: { id: patientId, firstName: "Aarav", lastName: "Sharma" },
    opdToken: {
      tokenNumber: "A-24",
      department: "General Medicine",
      nowServing: "A-19",
      patientsAhead: 5,
      estimatedWaitMinutes: 25,
      queueProgress: 0.6,
    },
    nextAppointment: {
      id: "apt_001",
      doctor: { id: "d_001", name: "Dr. Meera Iyer", specialty: "Cardiologist" },
      room: "204",
      scheduledAt: "2026-10-07T10:30:00+05:30",
    },
    vitals: {
      heartRate: { value: 72, unit: "bpm" },
      bloodPressure: { systolic: 120, diastolic: 80, unit: "mmHg" },
      bloodSugar: { value: 96, unit: "mg/dL" },
      recordedAt: "2026-10-06T08:00:00+05:30",
    },
  };
}
