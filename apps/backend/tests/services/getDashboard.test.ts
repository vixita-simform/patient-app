import { describe, expect, it } from "vitest";

import { getDashboard } from "../../src/services/dashboard";

describe("getDashboard", () => {
  it("returns the dashboard for the given patient", async () => {
    const dashboard = await getDashboard("p_042");
    expect(dashboard.patient.id).toBe("p_042");
    expect(dashboard.nextAppointment?.scheduledAt).toMatch(/[+-]\d{2}:\d{2}$/);
    expect(dashboard.vitals.recordedAt).toMatch(/[+-]\d{2}:\d{2}$/);
  });
});
