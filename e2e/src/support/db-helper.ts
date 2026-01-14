import { Pool, QueryResult } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });

/**
 * Database Helper for DAEE Platform E2E Tests
 * 
 * Purpose: Provides read-only database access for test verification (Sandwich Method)
 * 
 * Sandwich Method Pattern:
 * 1. DB BEFORE: Query initial state
 * 2. UI ACTION: Perform user interaction
 * 3. DB AFTER: Verify state change in database
 * 
 * CRITICAL: All queries are SELECT-only (Read-Only mode for first 45 days)
 */

let pool: Pool | null = null;

/**
 * Establishes a connection pool to the Supabase PostgreSQL database
 * 
 * @returns PostgreSQL connection pool
 * @throws Error if connection configuration is missing
 */
export function connectToDatabase(): Pool {
  if (pool) {
    return pool;
  }

  const config = {
    host: process.env.SUPABASE_DB_HOST,
    port: parseInt(process.env.SUPABASE_DB_PORT || '5432'),
    database: process.env.SUPABASE_DB_NAME,
    user: process.env.SUPABASE_DB_USER,
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: {
      rejectUnauthorized: false,
    },
    // Connection pool settings
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };

  // Validate required configuration
  if (!config.host || !config.password) {
    throw new Error(
      'Database configuration missing. Please check .env.local file:\n' +
      '  - SUPABASE_DB_HOST\n' +
      '  - SUPABASE_DB_PASSWORD'
    );
  }

  pool = new Pool(config);

  // Handle pool errors
  pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
  });

  console.log('✅ Database connection pool established');
  return pool;
}

/**
 * Executes a SELECT query with type safety
 * 
 * @template T - Expected return type for query results
 * @param query - SQL SELECT query
 * @param params - Query parameters (for parameterized queries)
 * @returns Query result rows
 * 
 * @example
 * const users = await executeQuery<{ id: string, email: string }>(
 *   'SELECT id, email FROM auth.users WHERE email = $1',
 *   ['admin@example.com']
 * );
 */
export async function executeQuery<T = any>(
  query: string,
  params?: any[]
): Promise<T[]> {
  // Enforce read-only mode
  const trimmedQuery = query.trim().toUpperCase();
  if (!trimmedQuery.startsWith('SELECT')) {
    throw new Error(
      'Only SELECT queries are allowed in read-only mode. ' +
      'Received query: ' + query.substring(0, 50)
    );
  }

  const dbPool = connectToDatabase();
  
  try {
    const result: QueryResult<T> = await dbPool.query(query, params);
    console.log(`✅ Query executed: ${result.rowCount} rows returned`);
    return result.rows;
  } catch (error: any) {
    console.error('❌ Database query failed:', error.message);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
}

/**
 * Closes the database connection pool
 * Should be called in test teardown
 */
export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✅ Database connection pool closed');
  }
}

// ==========================================
// Helper Methods for Common Queries
// ==========================================

/**
 * Fetches user details by email
 * 
 * @param email - User email address
 * @returns User record from auth.users table
 * 
 * @example Sandwich Method - Before UI Action
 * const userBefore = await getUserByEmail('admin@daee.test');
 * console.log('User auth state before login:', userBefore);
 */
export async function getUserByEmail(email: string): Promise<any | null> {
  const query = `
    SELECT 
      id,
      email,
      created_at,
      last_sign_in_at,
      app_metadata,
      user_metadata
    FROM auth.users
    WHERE email = $1
  `;
  
  const results = await executeQuery(query, [email]);
  return results.length > 0 ? results[0] : null;
}

/**
 * Fetches TOTP MFA factors for a user
 * 
 * @param userId - User UUID
 * @returns Array of MFA factors
 * 
 * @example Verify TOTP Setup
 * const factors = await getTOTPFactorForUser(userId);
 * const totpFactor = factors.find(f => f.factor_type === 'totp');
 * expect(totpFactor.status).toBe('verified');
 */
export async function getTOTPFactorForUser(userId: string): Promise<any[]> {
  const query = `
    SELECT 
      id,
      user_id,
      factor_type,
      status,
      created_at,
      updated_at
    FROM auth.mfa_factors
    WHERE user_id = $1 AND factor_type = 'totp'
  `;
  
  return await executeQuery(query, [userId]);
}

/**
 * Fetches active sessions for a user
 * 
 * @param userId - User UUID
 * @returns Array of active sessions
 * 
 * @example Sandwich Method - After UI Action
 * const sessionsAfter = await getUserSessions(userId);
 * const latestSession = sessionsAfter[0];
 * expect(latestSession.aal).toBe('aal2'); // MFA completed
 */
export async function getUserSessions(userId: string): Promise<any[]> {
  const query = `
    SELECT 
      id,
      user_id,
      aal,
      created_at,
      updated_at,
      factor_id
    FROM auth.sessions
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;
  
  return await executeQuery(query, [userId]);
}

/**
 * Fetches authentication audit log entries
 * 
 * @param userId - User UUID
 * @param action - Action type (e.g., 'login', 'mfa_verify')
 * @param limit - Number of records to fetch
 * @returns Array of audit log entries
 * 
 * @example Verify Login Audit Trail
 * const auditLogs = await getAuthenticationLog(userId, 'login', 5);
 * expect(auditLogs[0].action).toBe('login');
 */
export async function getAuthenticationLog(
  userId: string,
  action?: string,
  limit: number = 10
): Promise<any[]> {
  let query = `
    SELECT 
      id,
      instance_id,
      ip_address,
      created_at,
      payload
    FROM auth.audit_log_entries
    WHERE (payload->>'user_id')::uuid = $1
  `;
  
  const params: any[] = [userId];
  
  if (action) {
    query += ` AND payload->>'action' = $2`;
    params.push(action);
  }
  
  query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
  params.push(limit);
  
  return await executeQuery(query, params);
}

/**
 * Checks if user has completed MFA (AAL2)
 * 
 * @param userId - User UUID
 * @returns true if user has an active AAL2 session
 * 
 * @example
 * const hasMFA = await hasUserCompletedMFA(userId);
 * expect(hasMFA).toBe(true);
 */
export async function hasUserCompletedMFA(userId: string): Promise<boolean> {
  const sessions = await getUserSessions(userId);
  return sessions.length > 0 && sessions[0].aal === 'aal2';
}

/**
 * Gets the most recent session for a user
 * 
 * @param userId - User UUID
 * @returns Most recent session or null
 */
export async function getLatestSession(userId: string): Promise<any | null> {
  const sessions = await getUserSessions(userId);
  return sessions.length > 0 ? sessions[0] : null;
}
