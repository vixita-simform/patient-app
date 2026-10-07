import type { HealthResponse } from '@patient-app/shared-types';

export function GET(): Response {
  const body: HealthResponse = { status: 'ok' };
  return Response.json(body);
}
