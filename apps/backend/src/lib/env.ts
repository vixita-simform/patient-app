/**
 * The only module that reads `process.env`. Values are read lazily so a missing variable
 * fails the request that needs it (as a generic 500), not the whole build.
 */
export const env = {
  /** Secret used to sign and verify patient access tokens. */
  get authTokenSecret(): string {
    const value = process.env.AUTH_TOKEN_SECRET;
    if (!value || value.length < 32) {
      throw new Error('AUTH_TOKEN_SECRET is missing or shorter than 32 characters');
    }
    return value;
  },
  /** PostgreSQL connection string, e.g. `postgresql://user:pass@host:5432/db`. */
  get postgresConnectionString(): string {
    const value = process.env.POSTGRES_CONNECTION_STRING;
    if (!value) {
      throw new Error('POSTGRES_CONNECTION_STRING is missing');
    }
    return value;
  }
};
