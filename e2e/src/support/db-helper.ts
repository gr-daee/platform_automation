import { Pool, QueryResult } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load .env.local from project root so O2C and Finance (VAN) tests use the same DB config.
// Try both (1) path relative to this file and (2) cwd, so workers always get env regardless of run context.
const fromDir = path.resolve(__dirname, '../../../.env.local');
const fromCwd = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(fromDir)) {
  dotenv.config({ path: fromDir });
} else if (fs.existsSync(fromCwd)) {
  dotenv.config({ path: fromCwd });
} else {
  dotenv.config({ path: fromDir }); // may still load nothing; connectToDatabase() will validate
}

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

  // Validate required configuration (same .env.local used by O2C and Finance/VAN tests)
  if (!config.host || !config.password) {
    throw new Error(
      'Database configuration missing. Ensure .env.local at project root has SUPABASE_DB_HOST and SUPABASE_DB_PASSWORD (same config used by O2C and VAN tests).'
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
    // Same DB config is used by O2C (o2c-db-helpers) and Finance/VAN (finance-db-helpers). ENOTFOUND = host unreachable (VPN/network/DNS).
    if (error.message?.includes('ENOTFOUND') || error.code === 'ENOTFOUND') {
      console.error(
        '💡 ENOTFOUND: Supabase host is not reachable from this machine. Ensure VPN/network allows access to SUPABASE_DB_HOST and that O2C/Finance tests use the same .env.local.'
      );
    }
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

/**
 * Test cleanup only: DELETE from epd_discount_slabs for a given tenant and days range.
 * Use to remove E2E-created slabs (e.g. 91-99) so scenarios can run repeatedly.
 *
 * @param tenantId - Tenant UUID
 * @param daysFrom - days_from value
 * @param daysTo - days_to value
 * @returns Number of rows deleted (0 or 1)
 */
export async function executeDeleteEpdSlabForTestCleanup(
  tenantId: string,
  daysFrom: number,
  daysTo: number
): Promise<number> {
  const dbPool = connectToDatabase();
  const result = await dbPool.query(
    `DELETE FROM epd_discount_slabs WHERE tenant_id = $1 AND days_from = $2 AND days_to = $3`,
    [tenantId, daysFrom, daysTo]
  );
  const count = result.rowCount ?? 0;
  if (count > 0) console.log(`✅ Test cleanup: deleted ${count} epd_discount_slabs row(s) for ${daysFrom}-${daysTo} days`);
  return count;
}

/**
 * Test only: UPDATE discount_percentage in epd_discount_slabs for a given tenant and days range.
 * Use for TC-007 smart flow (set temporary %, then restore after test).
 *
 * @returns Number of rows updated (0 or 1)
 */
export async function executeUpdateEpdSlabDiscountForTestCleanup(
  tenantId: string,
  daysFrom: number,
  daysTo: number,
  discountPercent: number
): Promise<number> {
  const dbPool = connectToDatabase();
  const result = await dbPool.query(
    `UPDATE epd_discount_slabs SET discount_percentage = $4, updated_at = NOW() WHERE tenant_id = $1 AND days_from = $2 AND days_to = $3`,
    [tenantId, daysFrom, daysTo, discountPercent]
  );
  const count = result.rowCount ?? 0;
  if (count > 0) console.log(`✅ Test: updated epd_discount_slabs ${daysFrom}-${daysTo} to ${discountPercent}%`);
  return count;
}

/**
 * E2E test only: approve RFQ quote selection in DB (bypasses UI SoD when selector === approver).
 * Expects RFQ in `selection_pending` with winning_quote_id already set from UI.
 */
export async function approveRfqSelectionForE2ETest(
  rfqId: string,
  approverUserId: string
): Promise<number> {
  const dbPool = connectToDatabase();
  const result = await dbPool.query(
    `UPDATE rfq_headers
     SET status = 'selection_approved',
         selection_approved_by = $2::uuid,
         selection_approved_at = NOW(),
         updated_at = NOW()
     WHERE id = $1::uuid
       AND status = 'selection_pending'
       AND is_active = true`,
    [rfqId, approverUserId]
  );
  const count = result.rowCount ?? 0;
  if (count > 0) {
    console.log(`✅ E2E test: RFQ ${rfqId} set to selection_approved (DB)`);
  }
  return count;
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
  // Supabase auth.users uses raw_app_meta_data / raw_user_meta_data (not app_metadata).
  const query = `
    SELECT 
      id,
      email,
      created_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data
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
