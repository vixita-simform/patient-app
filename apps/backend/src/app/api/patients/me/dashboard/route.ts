import type { HomeDashboardResponse } from '@patient-app/shared-types';

import { notFound } from '../../../../../lib';
import { withAuth } from '../../../../../middlewares';
import { getDashboard } from '../../../../../services/dashboard';

// Per-patient data: never prerender or cache.
export const dynamic = 'force-dynamic';

export const GET = withAuth('GET /api/patients/me/dashboard', async (_request, { patientId }) => {
  const body: HomeDashboardResponse | null = await getDashboard(patientId);
  return body ? Response.json(body) : notFound('Patient not found.');
});
