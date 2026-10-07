/** Error body returned by every backend endpoint on failure. */
export interface ApiErrorResponse {
  error: {
    /** Stable machine-readable code the apps can branch on (e.g. "invalid_credentials"). */
    code: string;
    /** Message safe to show to the user. */
    message: string;
    details?: unknown;
  };
}

/** API response shape for the health check (GET /api/health). */
export interface HealthResponse {
  status: 'ok';
}
