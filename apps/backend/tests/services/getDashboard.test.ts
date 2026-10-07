import { beforeEach, describe, expect, it, vi } from "vitest";

import { query } from "../../src/config";
import { getDashboard } from "../../src/services/dashboard";

vi.mock("../../src/config", () => ({ query: vi.fn() }));

const mockQuery = vi.mocked(query);

/** Answers each SQL statement by the table it reads, whatever order they run in. */
const answer = (rows: {
  patient?: unknown[];
  appointment?: unknown[];
  queue?: unknown[];
  vitals?: unknown[];
}): void => {
  mockQuery.mockImplementation((async (text: string) => {
    if (text.includes("FROM patients")) return rows.patient ?? [];
    if (text.includes("FROM appointments")) return rows.appointment ?? [];
    if (text.includes("FROM opd_queue_tokens")) return rows.queue ?? [];
    if (text.includes("FROM vitals")) return rows.vitals ?? [];
    throw new Error(`unexpected query: ${text}`);
  }) as typeof query);
};

describe("getDashboard", () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it("maps database rows to the dashboard", async () => {
    answer({
      patient: [{ id: "42", first_name: "Aarav", last_name: "Sharma" }],
      appointment: [
        {
          id: "7",
          doctor_id: "3",
          doctor_name: "Dr. Meera Iyer",
          specialization: "Cardiologist",
          room_no: "204",
          scheduled_at: "2026-10-07T10:30:00+05:30",
        },
      ],
      queue: [
        {
          token_label: "A-24",
          token_number: 24,
          department: "General Medicine",
          token_prefix: "A",
          now_serving_number: 12,
          avg_consult_minutes: 5,
          patients_ahead: 5,
        },
      ],
      vitals: [
        { vital_type: "heart_rate", value_primary: "72.00", value_secondary: null, unit: "bpm", recorded_at: new Date("2026-10-06T02:30:00Z") },
        { vital_type: "blood_pressure", value_primary: "120.00", value_secondary: "80.00", unit: "mmHg", recorded_at: new Date("2026-10-06T02:30:00Z") },
        { vital_type: "blood_sugar", value_primary: "96.00", value_secondary: null, unit: "mg/dL", recorded_at: new Date("2026-10-05T02:30:00Z") },
      ],
    });
    const dashboard = await getDashboard("42");
    expect(dashboard).toEqual({
      patient: { id: "42", firstName: "Aarav", lastName: "Sharma" },
      opdToken: {
        tokenNumber: "A-24",
        department: "General Medicine",
        nowServing: "A-12",
        patientsAhead: 5,
        estimatedWaitMinutes: 25,
        queueProgress: 0.5,
      },
      nextAppointment: {
        id: "7",
        doctor: { id: "3", name: "Dr. Meera Iyer", specialty: "Cardiologist" },
        room: "204",
        scheduledAt: "2026-10-07T10:30:00+05:30",
      },
      vitals: {
        heartRate: { value: 72, unit: "bpm" },
        bloodPressure: { systolic: 120, diastolic: 80, unit: "mmHg" },
        bloodSugar: { value: 96, unit: "mg/dL" },
        recordedAt: "2026-10-06T02:30:00.000Z",
      },
    });
  });

  it("returns nulls for data the patient does not have", async () => {
    answer({ patient: [{ id: "42", first_name: "Aarav", last_name: null }] });
    const dashboard = await getDashboard("42");
    expect(dashboard).toEqual({
      patient: { id: "42", firstName: "Aarav", lastName: "" },
      opdToken: null,
      nextAppointment: null,
      vitals: { heartRate: null, bloodPressure: null, bloodSugar: null, recordedAt: null },
    });
  });

  it("returns null for an unknown patient", async () => {
    answer({});
    expect(await getDashboard("999")).toBeNull();
  });

  it("returns null without querying for a non-numeric id", async () => {
    expect(await getDashboard("p_001")).toBeNull();
    expect(mockQuery).not.toHaveBeenCalled();
  });
});
