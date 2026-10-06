import type { HomeDashboardResponse } from "@patient-app/shared-types";

import { getAuthenticatedPatientId, internalError, unauthorized } from "../../../../../lib";
import { getDashboard } from "../../../../../services/dashboard";

// Per-patient data: never prerender or cache.
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  try {
    const patientId = getAuthenticatedPatientId(request);
    if (!patientId) {
      return unauthorized();
    }
    const body: HomeDashboardResponse = await getDashboard(patientId);
    return Response.json(body);
  } catch (error) {
    return internalError("GET /api/patients/me/dashboard", error);
  }
}
