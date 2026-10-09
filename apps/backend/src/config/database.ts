import { Pool, type QueryResultRow } from 'pg';

import { env } from '../lib';

// Next.js dev reloads modules on every edit; keeping the pool on globalThis stops each
// reload from opening a new set of connections.
const globalForDb = globalThis as typeof globalThis & { __patientAppPool?: Pool };

/**
 * The shared PostgreSQL connection pool. Created on first use, so a missing connection
 * string fails the request that needs it, not the build.
 * @returns the pool.
 */
export function getPool(): Pool {
  if (!globalForDb.__patientAppPool) {
    const pool = new Pool({ connectionString: env.postgresConnectionString, max: 10 });
    // An idle client can drop (network blip, DB restart); log it instead of crashing the process.
    pool.on('error', (error) => console.error('[database] idle client error:', error.message));
    globalForDb.__patientAppPool = pool;
  }
  return globalForDb.__patientAppPool;
}

/**
 * Runs a parameterised SQL query. Always pass user input through `params`, never by
 * string concatenation.
 * @param text - SQL with `$1`, `$2` ... placeholders.
 * @param params - values for the placeholders.
 * @returns the result rows.
 */
export async function query<Row extends QueryResultRow>(
  text: string,
  params: readonly unknown[] = []
): Promise<Row[]> {
  const result = await getPool().query<Row>(text, [...params]);
  return result.rows;
}

/** Runs parameterised SQL on the client that owns the current transaction. */
export type TransactionQuery = <Row extends QueryResultRow>(
  text: string,
  params?: readonly unknown[]
) => Promise<Row[]>;

/**
 * Runs `work` inside one transaction: committed when it resolves, rolled back when it throws.
 * @param work - the queries to run; use the `query` it is given, not the pool's.
 * @returns what `work` returns.
 */
export async function withTransaction<T>(
  work: (query: TransactionQuery) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  const run: TransactionQuery = async (text, params = []) =>
    (await client.query(text, [...params])).rows;
  try {
    await client.query('BEGIN');
    const result = await work(run);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
