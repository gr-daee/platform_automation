#!/usr/bin/env node
/**
 * VAN API VAPT Harness - Enhanced
 *
 * Covers the following attack categories against:
 *   POST /functions/v1/axis-bank-validation
 *   POST /functions/v1/axis-bank-posting
 *
 * Categories:
 *   A - Authentication & API key controls
 *   B - HMAC signature integrity
 *   C - Timestamp / replay prevention
 *   D - Request method & content-type abuse
 *   E - Input validation & injection
 *   F - Business logic abuse
 *   G - Information disclosure & error leakage
 *   H - Rate limiting / DoS resilience
 *
 * Usage:
 *   node scripts/vapt/run-van-vapt.js              (staging - full suite)
 *   node scripts/vapt/run-van-vapt.js --mode=prod  (prod-safe - attack-only, no state-changing positive controls)
 */

const crypto = require('crypto');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const PROD_SAFE = process.argv.includes('--mode=prod');
const MODE_LABEL = PROD_SAFE ? 'prod-safe (attack-only)' : 'full (staging)';

// ---------------------------------------------------------------------------
// Config & helpers
// ---------------------------------------------------------------------------
function getConfig() {
  return {
    baseUrl: process.env.VAN_API_BASE_URL || 'https://api-staging.daee.in',
    apiKey: process.env.VAN_API_KEY || '',
    sharedSecret: process.env.VAN_SHARED_SECRET || '',
  };
}

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

function makeSignature(secret, method, signaturePath, body, timestamp) {
  const payload = `${method}${signaturePath}${body}${timestamp}`;
  return crypto.createHmac('sha256', secret).update(payload).digest('hex').toLowerCase();
}

function parseSuccess(data) {
  const stts = data?.Stts_flg ?? data?.status;
  const errCd = data?.Err_cd ?? data?.error_code;
  if (typeof stts === 'string' && stts.toUpperCase() === 'S') return true;
  if (typeof errCd === 'string' && errCd === '000') return true;
  return false;
}

function isAccepted(result) {
  return !!(result.ok && parseSuccess(result.data || {}));
}

function buildPayload(overrides = {}) {
  const ts = nowSeconds();
  return {
    Req_type: 'validation',
    Tran_id: `VAPT_${ts}_TRAN`,
    Req_date: new Date().toISOString().split('T')[0],
    UTR: `VAPT_${ts}_UTR`,
    Bene_acc_no: 'IACS1234',
    Corp_code: 'IACS',
    Txn_amnt: '234.56',
    Pmode: 'NEFT',
    Sndr_acnt: '1122334455',
    Sndr_ifsc: 'HDFC0009307',
    Sndr_nm: 'VAPT Test Sender',
    ...overrides,
  };
}

async function sendRequest({
  endpoint,
  signaturePath,
  payload,
  apiKey,
  sharedSecret,
  method = 'POST',
  timestampOverride,
  signatureOverride,
  removeHeaders = [],
  extraHeaders = {},
  rawBody,
  contentTypeOverride,
}) {
  const timestamp = timestampOverride ?? nowSeconds();
  const body = rawBody ?? JSON.stringify(payload);
  const signature =
    signatureOverride ?? makeSignature(sharedSecret, method, signaturePath, body, timestamp);
  const headers = {
    'Content-Type': contentTypeOverride ?? 'application/json',
    'X-API-KEY': apiKey,
    'X-Timestamp': String(timestamp),
    'X-Signature': signature,
    ...extraHeaders,
  };
  for (const h of removeHeaders) delete headers[h];

  const start = Date.now();
  try {
    const response = await fetch(endpoint, { method, headers, body });
    let data = {};
    try {
      data = await response.json();
    } catch {
      data = { message: 'non-json-response' };
    }
    const responseHeaders = {};
    response.headers.forEach((v, k) => { responseHeaders[k] = v; });
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      durationMs: Date.now() - start,
      data,
      headers,
      responseHeaders,
      body,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      statusText: '',
      durationMs: Date.now() - start,
      data: { message: error instanceof Error ? error.message : String(error) },
      headers,
      responseHeaders: {},
      body,
    };
  }
}

// ---------------------------------------------------------------------------
// DB helpers
// ---------------------------------------------------------------------------
async function maybeCreateDbPool() {
  const required = ['SUPABASE_DB_HOST', 'SUPABASE_DB_PASSWORD'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) return null;
  return new Pool({
    host: process.env.SUPABASE_DB_HOST,
    port: parseInt(process.env.SUPABASE_DB_PORT || '5432', 10),
    database: process.env.SUPABASE_DB_NAME || 'postgres',
    user: process.env.SUPABASE_DB_USER || 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });
}

async function countRowsForPrefix(pool, prefix) {
  if (!pool) return null;
  const q = await pool.query(
    `SELECT COUNT(*)::int AS total FROM van_payment_collections WHERE (utr LIKE $1 OR tran_id LIKE $1)`,
    [`${prefix}%`]
  );
  return q.rows[0]?.total ?? 0;
}

// ---------------------------------------------------------------------------
// Finding classification
// ---------------------------------------------------------------------------
// severity: CRITICAL | HIGH | MEDIUM | LOW | OBSERVATION
function classifyFinding(caseName, category, accepted, expectedAccept, result) {
  if (accepted === expectedAccept) return null;

  // Attack passed (should have been rejected)
  if (expectedAccept === false && accepted === true) {
    const criticalCategories = ['A', 'B', 'C', 'F'];
    const severity = criticalCategories.includes(category) ? 'CRITICAL' : 'HIGH';
    return {
      severity,
      category,
      caseName,
      issue: 'Attack case was accepted unexpectedly — security control missing or bypassed',
      status: result.status,
      response: result.data,
    };
  }
  // Positive control failed
  return {
    severity: 'MEDIUM',
    category,
    caseName,
    issue: 'Positive control failed unexpectedly — may indicate a regression or misconfiguration',
    status: result.status,
    response: result.data,
  };
}

// Observations: cases that passed but have quality issues (e.g. 500 instead of 4xx)
function observeResult(caseName, category, result, note) {
  return { severity: 'OBSERVATION', category, caseName, note, status: result.status, response: result.data };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function run() {
  const { baseUrl, apiKey, sharedSecret } = getConfig();
  if (!apiKey || !sharedSecret) {
    console.error('Missing VAN_API_KEY or VAN_SHARED_SECRET in .env.local');
    process.exit(1);
  }

  console.log(`\n====================================================`);
  console.log(` VAN API VAPT  |  mode: ${MODE_LABEL}`);
  console.log(` Target: ${baseUrl}`);
  console.log(`====================================================\n`);

  const validationUrl = `${baseUrl}/functions/v1/axis-bank-validation`;
  const postingUrl    = `${baseUrl}/functions/v1/axis-bank-posting`;
  const dbPool = await maybeCreateDbPool();
  const prefix = `VAPT_${nowSeconds()}`;
  const baseline = await countRowsForPrefix(dbPool, prefix);

  const results = [];
  const findings = [];
  const observations = [];

  async function executeCase(name, category, expectedAccept, fn, opts = {}) {
    const result = await fn();
    const accepted = isAccepted(result);
    const passed = accepted === expectedAccept;
    const finding = classifyFinding(name, category, accepted, expectedAccept, result);
    if (finding) findings.push(finding);

    // Flag 500s on attack cases as observations (should be 4xx)
    if (!expectedAccept && result.status === 500) {
      observations.push(
        observeResult(name, category, result, 'Server returned 500 instead of a clean 4xx — review error handling')
      );
    }

    // Check for sensitive data leakage in response body
    const responseStr = JSON.stringify(result.data || {}).toLowerCase();
    const leakagePatterns = ['stack', 'traceback', 'exception', 'postgres', 'sql', 'secret', 'key', 'password', 'internal server'];
    const leaked = leakagePatterns.filter((p) => responseStr.includes(p));
    if (leaked.length > 0) {
      observations.push(
        observeResult(name, category, result, `Possible sensitive data leakage in response: ${leaked.join(', ')}`)
      );
    }

    // Flag missing security headers
    if (opts.checkSecurityHeaders) {
      const rh = result.responseHeaders || {};
      const missingHeaders = [];
      if (!rh['x-content-type-options']) missingHeaders.push('X-Content-Type-Options');
      if (!rh['x-frame-options'] && !rh['content-security-policy']) missingHeaders.push('X-Frame-Options / CSP');
      if (!rh['strict-transport-security']) missingHeaders.push('Strict-Transport-Security');
      if (missingHeaders.length) {
        observations.push(
          observeResult(name, category, result, `Missing security response headers: ${missingHeaders.join(', ')}`)
        );
      }
    }

    results.push({
      name,
      category,
      expectedAccept,
      accepted,
      passed,
      status: result.status,
      durationMs: result.durationMs,
      message: result.data?.message || result.data?.Err_cd || result.data?.error_code || '',
    });
    const mark = passed ? 'PASS' : 'FAIL';
    const obs = observations.filter((o) => o.caseName === name).length ? ' [OBS]' : '';
    console.log(`[${mark}]${obs} [${category}] ${name} -> status=${result.status} accepted=${accepted} (${result.durationMs}ms)`);
  }

  // -----------------------------------------------------------------------
  // A. Authentication & API key controls
  // -----------------------------------------------------------------------
  console.log('\n--- A. Authentication & API key controls ---');

  if (!PROD_SAFE) {
    await executeCase('A1 Validation positive control', 'A', true, async () => {
      return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
        payload: buildPayload({ Tran_id: `${prefix}_A1`, UTR: `${prefix}_A1` }), apiKey, sharedSecret });
    }, { checkSecurityHeaders: true });
  }

  await executeCase('A2 Validation missing API key', 'A', false, async () => {
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload: buildPayload({ Tran_id: `${prefix}_A2`, UTR: `${prefix}_A2` }), apiKey, sharedSecret,
      removeHeaders: ['X-API-KEY'] });
  });

  await executeCase('A3 Validation invalid API key', 'A', false, async () => {
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload: buildPayload({ Tran_id: `${prefix}_A3`, UTR: `${prefix}_A3` }),
      apiKey: `${apiKey}_INVALID`, sharedSecret });
  });

  await executeCase('A4 Validation empty API key string', 'A', false, async () => {
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload: buildPayload({ Tran_id: `${prefix}_A4`, UTR: `${prefix}_A4` }),
      apiKey: '', sharedSecret });
  });

  await executeCase('A5 Posting missing API key', 'A', false, async () => {
    return sendRequest({ endpoint: postingUrl, signaturePath: '/axis-bank-posting',
      payload: { ...buildPayload({ Tran_id: `${prefix}_A5`, UTR: `${prefix}_A5` }), Req_type: 'notification' },
      apiKey, sharedSecret, removeHeaders: ['X-API-KEY'] });
  });

  await executeCase('A6 Validation API key in URL (should reject)', 'A', false, async () => {
    const url = `${validationUrl}?api_key=${apiKey}`;
    return sendRequest({ endpoint: url, signaturePath: '/axis-bank-validation',
      payload: buildPayload({ Tran_id: `${prefix}_A6`, UTR: `${prefix}_A6` }),
      apiKey: 'invalid', sharedSecret });
  });

  // -----------------------------------------------------------------------
  // B. HMAC signature integrity
  // -----------------------------------------------------------------------
  console.log('\n--- B. HMAC signature integrity ---');

  await executeCase('B1 Validation missing signature header', 'B', false, async () => {
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload: buildPayload({ Tran_id: `${prefix}_B1`, UTR: `${prefix}_B1` }), apiKey, sharedSecret,
      removeHeaders: ['X-Signature'] });
  });

  await executeCase('B2 Validation invalid signature (gibberish)', 'B', false, async () => {
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload: buildPayload({ Tran_id: `${prefix}_B2`, UTR: `${prefix}_B2` }), apiKey, sharedSecret,
      signatureOverride: 'deadbeefdeadbeef' });
  });

  await executeCase('B3 Validation empty signature string', 'B', false, async () => {
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload: buildPayload({ Tran_id: `${prefix}_B3`, UTR: `${prefix}_B3` }), apiKey, sharedSecret,
      signatureOverride: '' });
  });

  await executeCase('B4 Validation wrong path in signature (path swap attack)', 'B', false, async () => {
    const payload = buildPayload({ Tran_id: `${prefix}_B4`, UTR: `${prefix}_B4` });
    const body = JSON.stringify(payload);
    const ts = nowSeconds();
    // Sign using /axis-bank-posting path but send to /axis-bank-validation
    const sig = makeSignature(sharedSecret, 'POST', '/axis-bank-posting', body, ts);
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload, apiKey, sharedSecret, timestampOverride: ts, signatureOverride: sig });
  });

  await executeCase('B5 Validation body tamper after signing (amount inflation)', 'B', false, async () => {
    const payload = buildPayload({ Tran_id: `${prefix}_B5`, UTR: `${prefix}_B5`, Txn_amnt: '234.56' });
    const ts = nowSeconds();
    const signedBody = JSON.stringify(payload);
    const sig = makeSignature(sharedSecret, 'POST', '/axis-bank-validation', signedBody, ts);
    const tampered = JSON.stringify({ ...payload, Txn_amnt: '99999999.00' });
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload, apiKey, sharedSecret, timestampOverride: ts, signatureOverride: sig, rawBody: tampered });
  });

  await executeCase('B6 Validation VAN tamper after signing (cross-tenant VAN swap)', 'B', false, async () => {
    const payload = buildPayload({ Tran_id: `${prefix}_B6`, UTR: `${prefix}_B6`, Bene_acc_no: 'IACS1234' });
    const ts = nowSeconds();
    const signedBody = JSON.stringify(payload);
    const sig = makeSignature(sharedSecret, 'POST', '/axis-bank-validation', signedBody, ts);
    const tampered = JSON.stringify({ ...payload, Bene_acc_no: 'OTHERTENANT999' });
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload, apiKey, sharedSecret, timestampOverride: ts, signatureOverride: sig, rawBody: tampered });
  });

  await executeCase('B7 Posting body tamper after signing', 'B', false, async () => {
    const payload = { ...buildPayload({ Tran_id: `${prefix}_B7`, UTR: `${prefix}_B7` }), Req_type: 'notification' };
    const ts = nowSeconds();
    const signedBody = JSON.stringify(payload);
    const sig = makeSignature(sharedSecret, 'POST', '/axis-bank-posting', signedBody, ts);
    const tampered = JSON.stringify({ ...payload, Txn_amnt: '99999999.00' });
    return sendRequest({ endpoint: postingUrl, signaturePath: '/axis-bank-posting',
      payload, apiKey, sharedSecret, timestampOverride: ts, signatureOverride: sig, rawBody: tampered });
  });

  await executeCase('B8 Validation wrong HMAC algorithm (MD5 signature)', 'B', false, async () => {
    const payload = buildPayload({ Tran_id: `${prefix}_B8`, UTR: `${prefix}_B8` });
    const body = JSON.stringify(payload);
    const ts = nowSeconds();
    const md5sig = crypto.createHmac('md5', sharedSecret)
      .update(`POST/axis-bank-validation${body}${ts}`).digest('hex');
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload, apiKey, sharedSecret, timestampOverride: ts, signatureOverride: md5sig });
  });

  // -----------------------------------------------------------------------
  // C. Timestamp / replay prevention
  // -----------------------------------------------------------------------
  console.log('\n--- C. Timestamp / replay prevention ---');

  await executeCase('C1 Validation stale timestamp (10 min old)', 'C', false, async () => {
    const payload = buildPayload({ Tran_id: `${prefix}_C1`, UTR: `${prefix}_C1` });
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload, apiKey, sharedSecret, timestampOverride: nowSeconds() - 600 });
  });

  await executeCase('C2 Validation very old timestamp (1 day old)', 'C', false, async () => {
    const payload = buildPayload({ Tran_id: `${prefix}_C2`, UTR: `${prefix}_C2` });
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload, apiKey, sharedSecret, timestampOverride: nowSeconds() - 86400 });
  });

  await executeCase('C3 Validation future timestamp (1 hour ahead)', 'C', false, async () => {
    const payload = buildPayload({ Tran_id: `${prefix}_C3`, UTR: `${prefix}_C3` });
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload, apiKey, sharedSecret, timestampOverride: nowSeconds() + 3600 });
  });

  await executeCase('C4 Validation missing timestamp header', 'C', false, async () => {
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload: buildPayload({ Tran_id: `${prefix}_C4`, UTR: `${prefix}_C4` }), apiKey, sharedSecret,
      removeHeaders: ['X-Timestamp'] });
  });

  await executeCase('C5 Posting duplicate UTR replay (idempotency)', 'C', false, async () => {
    const token = `${prefix}_C5`;
    const payload = buildPayload({ Tran_id: token, UTR: token });
    const v = await sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload, apiKey, sharedSecret });
    if (!isAccepted(v)) return v;
    const p1 = await sendRequest({ endpoint: postingUrl, signaturePath: '/axis-bank-posting',
      payload: { ...payload, Req_type: 'notification' }, apiKey, sharedSecret });
    if (!isAccepted(p1)) return p1;
    return sendRequest({ endpoint: postingUrl, signaturePath: '/axis-bank-posting',
      payload: { ...payload, Req_type: 'notification' }, apiKey, sharedSecret });
  });

  await executeCase('C6 Posting exact request replay (same signed packet)', 'C', false, async () => {
    const token = `${prefix}_C6`;
    const payload = buildPayload({ Tran_id: token, UTR: token });
    const v = await sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload, apiKey, sharedSecret });
    if (!isAccepted(v)) return v;
    const ts = nowSeconds();
    const postPayload = { ...payload, Req_type: 'notification' };
    const body = JSON.stringify(postPayload);
    const sig = makeSignature(sharedSecret, 'POST', '/axis-bank-posting', body, ts);
    const p1 = await sendRequest({ endpoint: postingUrl, signaturePath: '/axis-bank-posting',
      payload: postPayload, apiKey, sharedSecret, timestampOverride: ts, signatureOverride: sig });
    if (!isAccepted(p1)) return p1;
    // Replay exact same signed request
    return sendRequest({ endpoint: postingUrl, signaturePath: '/axis-bank-posting',
      payload: postPayload, apiKey, sharedSecret, timestampOverride: ts, signatureOverride: sig });
  });

  // -----------------------------------------------------------------------
  // D. Request method & content-type abuse
  // -----------------------------------------------------------------------
  console.log('\n--- D. Request method & content-type abuse ---');

  await executeCase('D1 Validation GET request (method not allowed)', 'D', false, async () => {
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload: buildPayload({ Tran_id: `${prefix}_D1`, UTR: `${prefix}_D1` }), apiKey, sharedSecret,
      method: 'GET' });
  });

  await executeCase('D2 Validation wrong content-type (text/plain)', 'D', false, async () => {
    const payload = buildPayload({ Tran_id: `${prefix}_D2`, UTR: `${prefix}_D2` });
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload, apiKey, sharedSecret, contentTypeOverride: 'text/plain' });
  });

  await executeCase('D3 Validation form-urlencoded content-type', 'D', false, async () => {
    const payload = buildPayload({ Tran_id: `${prefix}_D3`, UTR: `${prefix}_D3` });
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload, apiKey, sharedSecret, contentTypeOverride: 'application/x-www-form-urlencoded' });
  });

  await executeCase('D4 Validation empty body', 'D', false, async () => {
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload: {}, apiKey, sharedSecret, rawBody: '' });
  });

  await executeCase('D5 Validation non-JSON body', 'D', false, async () => {
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload: {}, apiKey, sharedSecret, rawBody: 'not-json-at-all' });
  });

  // -----------------------------------------------------------------------
  // E. Input validation & injection
  // -----------------------------------------------------------------------
  console.log('\n--- E. Input validation & injection ---');

  await executeCase('E1 Validation SQL injection in UTR', 'E', false, async () => {
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload: buildPayload({ Tran_id: `${prefix}_E1`, UTR: `' OR '1'='1` }), apiKey, sharedSecret });
  });

  await executeCase('E2 Validation NoSQL/JSON injection in Sndr_nm', 'E', false, async () => {
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload: buildPayload({ Tran_id: `${prefix}_E2`, UTR: `${prefix}_E2`,
        Sndr_nm: '{"$gt": ""}' }), apiKey, sharedSecret });
  });

  await executeCase('E3 Validation XSS payload in Sndr_nm', 'E', false, async () => {
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload: buildPayload({ Tran_id: `${prefix}_E3`, UTR: `${prefix}_E3`,
        Sndr_nm: '<script>alert(1)</script>' }), apiKey, sharedSecret });
  });

  await executeCase('E4 Validation zero amount', 'E', false, async () => {
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload: buildPayload({ Tran_id: `${prefix}_E4`, UTR: `${prefix}_E4`, Txn_amnt: '0' }),
      apiKey, sharedSecret });
  });

  await executeCase('E5 Validation negative amount', 'E', false, async () => {
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload: buildPayload({ Tran_id: `${prefix}_E5`, UTR: `${prefix}_E5`, Txn_amnt: '-100.00' }),
      apiKey, sharedSecret });
  });

  await executeCase('E6 Validation extremely large amount (overflow probe)', 'E', false, async () => {
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload: buildPayload({ Tran_id: `${prefix}_E6`, UTR: `${prefix}_E6`,
        Txn_amnt: '99999999999999999999999999.99' }), apiKey, sharedSecret });
  });

  await executeCase('E7 Validation type confusion - amount as object', 'E', false, async () => {
    const payload = buildPayload({ Tran_id: `${prefix}_E7`, UTR: `${prefix}_E7` });
    const malformed = JSON.stringify({ ...payload, Txn_amnt: { value: 100, currency: 'INR' } });
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload, apiKey, sharedSecret, rawBody: malformed });
  });

  await executeCase('E8 Validation type confusion - UTR as array', 'E', false, async () => {
    const payload = buildPayload({ Tran_id: `${prefix}_E8`, UTR: `${prefix}_E8` });
    const malformed = JSON.stringify({ ...payload, UTR: ['a', 'b', 'c'] });
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload, apiKey, sharedSecret, rawBody: malformed });
  });

  await executeCase('E9 Validation null byte injection in UTR', 'E', false, async () => {
    const payload = buildPayload({ Tran_id: `${prefix}_E9`, UTR: `${prefix}_E9\x00INJECTED` });
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload, apiKey, sharedSecret });
  });

  await executeCase('E10 Validation oversized payload (10KB body)', 'E', false, async () => {
    const bigStr = 'A'.repeat(10000);
    const payload = buildPayload({ Tran_id: `${prefix}_E10`, UTR: `${prefix}_E10`, Sndr_nm: bigStr });
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload, apiKey, sharedSecret });
  });

  await executeCase('E11 Validation missing required field (UTR omitted)', 'E', false, async () => {
    const payload = buildPayload({ Tran_id: `${prefix}_E11` });
    delete payload.UTR;
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload, apiKey, sharedSecret });
  });

  await executeCase('E12 Validation missing required field (Txn_amnt omitted)', 'E', false, async () => {
    const payload = buildPayload({ Tran_id: `${prefix}_E12`, UTR: `${prefix}_E12` });
    delete payload.Txn_amnt;
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload, apiKey, sharedSecret });
  });

  // -----------------------------------------------------------------------
  // F. Business logic abuse
  // -----------------------------------------------------------------------
  console.log('\n--- F. Business logic abuse ---');

  await executeCase('F1 Posting without prior validation', 'F', false, async () => {
    const token = `${prefix}_F1_NOVALIDATE`;
    return sendRequest({ endpoint: postingUrl, signaturePath: '/axis-bank-posting',
      payload: { ...buildPayload({ Tran_id: token, UTR: token }), Req_type: 'notification' },
      apiKey, sharedSecret });
  });

  await executeCase('F2 Posting with wrong Req_type (validation instead of notification)', 'F', false, async () => {
    const token = `${prefix}_F2`;
    const payload = buildPayload({ Tran_id: token, UTR: token });
    const v = await sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload, apiKey, sharedSecret });
    if (!isAccepted(v)) return v;
    // Send posting with Req_type still 'validation'
    return sendRequest({ endpoint: postingUrl, signaturePath: '/axis-bank-posting',
      payload: { ...payload, Req_type: 'validation' }, apiKey, sharedSecret });
  });

  await executeCase('F3 Cross-tenant VAN (Corp_code mismatch)', 'F', false, async () => {
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload: buildPayload({ Tran_id: `${prefix}_F3`, UTR: `${prefix}_F3`,
        Bene_acc_no: 'IACS1234', Corp_code: 'OTHERCORP' }), apiKey, sharedSecret });
  });

  await executeCase('F4 Unknown VAN (non-existent Bene_acc_no)', 'F', false, async () => {
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload: buildPayload({ Tran_id: `${prefix}_F4`, UTR: `${prefix}_F4`,
        Bene_acc_no: 'NONEXISTENT_VAN_99999' }), apiKey, sharedSecret });
  });

  await executeCase('F5 Posting with mismatched UTR/Tran_id vs validated', 'F', false, async () => {
    const token = `${prefix}_F5`;
    const payload = buildPayload({ Tran_id: token, UTR: token });
    const v = await sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload, apiKey, sharedSecret });
    if (!isAccepted(v)) return v;
    // Post with a different UTR than what was validated
    return sendRequest({ endpoint: postingUrl, signaturePath: '/axis-bank-posting',
      payload: { ...payload, Req_type: 'notification', UTR: `${prefix}_F5_DIFF_UTR` },
      apiKey, sharedSecret });
  });

  await executeCase('F6 Validation with past Req_date (30 days old)', 'F', false, async () => {
    const pastDate = new Date(Date.now() - 30 * 86400 * 1000).toISOString().split('T')[0];
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload: buildPayload({ Tran_id: `${prefix}_F6`, UTR: `${prefix}_F6`, Req_date: pastDate }),
      apiKey, sharedSecret });
  });

  // -----------------------------------------------------------------------
  // G. Information disclosure
  // -----------------------------------------------------------------------
  console.log('\n--- G. Information disclosure ---');

  await executeCase('G1 OPTIONS preflight (CORS headers check)', 'G', false, async () => {
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload: {}, apiKey, sharedSecret, method: 'OPTIONS', rawBody: '' });
  }, { checkSecurityHeaders: true });

  await executeCase('G2 HEAD request (method not allowed)', 'G', false, async () => {
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload: {}, apiKey, sharedSecret, method: 'HEAD', rawBody: '' });
  });

  await executeCase('G3 Malformed JSON triggers 500 (should be 400)', 'G', false, async () => {
    return sendRequest({ endpoint: validationUrl, signaturePath: '/axis-bank-validation',
      payload: {}, apiKey, sharedSecret, rawBody: '{invalid json}' });
  });

  // -----------------------------------------------------------------------
  // H. Rate limiting / DoS resilience
  // -----------------------------------------------------------------------
  console.log('\n--- H. Rate limiting / DoS resilience ---');

  // 30-request burst with invalid signatures (non-state-changing)
  const burstCount = 30;
  console.log(`  Running ${burstCount}-request burst (invalid sigs)...`);
  const burstResponses = await Promise.all(
    Array.from({ length: burstCount }).map((_, i) =>
      sendRequest({
        endpoint: validationUrl,
        signaturePath: '/axis-bank-validation',
        payload: buildPayload({ Tran_id: `${prefix}_BURST_${i}`, UTR: `${prefix}_BURST_${i}` }),
        apiKey,
        sharedSecret,
        signatureOverride: 'deadbeef',
      })
    )
  );
  const rate429 = burstResponses.filter((r) => r.status === 429).length;
  const burstPassed = rate429 > 0;
  const burstResult = {
    name: 'H1 Rate limiting: 30-request burst (invalid sigs)',
    category: 'H',
    expectedAccept: false,
    accepted: false,
    passed: burstPassed,
    status: `${rate429}/${burstCount} got 429`,
    durationMs: 0,
    message: burstPassed
      ? `Rate limit active: ${rate429} of ${burstCount} requests throttled`
      : `WARNING: No 429 observed in ${burstCount}-request burst — rate limiting may not be active`,
  };
  results.push(burstResult);
  if (!burstPassed) {
    observations.push({
      severity: 'OBSERVATION',
      category: 'H',
      caseName: 'H1 Rate limiting',
      note: `No 429 response in ${burstCount}-request burst. Consider enabling rate limiting / DDoS protection for production.`,
      status: '0/30 got 429',
    });
  }
  console.log(`[${burstPassed ? 'PASS' : 'WARN'}] H1 Rate limiting -> 429s: ${rate429}/${burstCount}`);

  // -----------------------------------------------------------------------
  // DB side-effect verification
  // -----------------------------------------------------------------------
  const after = await countRowsForPrefix(dbPool, prefix);
  const dbDelta = baseline !== null && after !== null ? after - baseline : null;

  // In prod-safe mode: any DB row creation by attack cases would be critical
  const maxExpectedRows = PROD_SAFE ? 0 : 3;
  if (dbDelta !== null && dbDelta > maxExpectedRows) {
    findings.push({
      severity: 'CRITICAL',
      category: 'F',
      caseName: 'DB side-effect verification',
      issue: `Attack traffic created ${dbDelta} unexpected DB rows (expected <= ${maxExpectedRows}). Possible data pollution.`,
      status: 'DB check',
      response: { dbDelta },
    });
  }

  // -----------------------------------------------------------------------
  // Report
  // -----------------------------------------------------------------------
  if (dbPool) await dbPool.end();

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  const criticalFindings = findings.filter((f) => f.severity === 'CRITICAL');
  const highFindings = findings.filter((f) => f.severity === 'HIGH');
  const mediumFindings = findings.filter((f) => f.severity === 'MEDIUM');

  const report = {
    executedAt: new Date().toISOString(),
    mode: MODE_LABEL,
    environment: baseUrl,
    prefix,
    totals: { total: results.length, passed: passedCount, failed: failedCount },
    securitySummary: {
      critical: criticalFindings.length,
      high: highFindings.length,
      medium: mediumFindings.length,
      observations: observations.length,
    },
    rateLimitProbe: { burstRequests: burstCount, responses429: rate429 },
    dbSideEffectDelta: dbDelta,
    findings,
    observations,
    results,
  };

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = path.resolve(process.cwd(), 'reports/security');
  fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, `van-vapt-${ts}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');

  const mdLines = [
    '# VAN API VAPT Report',
    '',
    `| Field | Value |`,
    `|---|---|`,
    `| Executed At | ${report.executedAt} |`,
    `| Mode | ${MODE_LABEL} |`,
    `| Environment | ${baseUrl} |`,
    `| Total Cases | ${report.totals.total} |`,
    `| Passed | ${report.totals.passed} |`,
    `| Failed | ${report.totals.failed} |`,
    `| CRITICAL Findings | ${criticalFindings.length} |`,
    `| HIGH Findings | ${highFindings.length} |`,
    `| MEDIUM Findings | ${mediumFindings.length} |`,
    `| Observations | ${observations.length} |`,
    `| Rate Limit 429s in ${burstCount}-req burst | ${rate429} |`,
    `| DB Side Effect Delta | ${dbDelta === null ? 'N/A' : dbDelta} |`,
    '',
    '## Security Findings',
    '',
    findings.length === 0
      ? '_No security findings — all attack cases rejected correctly._'
      : findings.map((f) =>
          `### [${f.severity}] ${f.caseName}\n- **Category**: ${f.category}\n- **Issue**: ${f.issue}\n- **HTTP Status**: ${f.status}\n- **Response**: \`${JSON.stringify(f.response)}\``
        ).join('\n\n'),
    '',
    '## Observations (Quality / Hardening)',
    '',
    observations.length === 0
      ? '_No observations._'
      : observations.map((o) =>
          `- [${o.severity}] [${o.category}] ${o.caseName}: ${o.note}`
        ).join('\n'),
    '',
    '## All Case Results',
    '',
    '| Result | Category | Case | Status | Accepted | Expected |',
    '|---|---|---|---|---|---|',
    ...results.map(
      (r) =>
        `| ${r.passed ? 'PASS' : 'FAIL'} | ${r.category} | ${r.name} | ${r.status} | ${r.accepted} | ${r.expectedAccept} |`
    ),
    '',
    `**JSON report**: \`${jsonPath}\``,
    '',
    '## Production Readiness Checklist',
    '',
    `- [ ] All CRITICAL/HIGH findings resolved`,
    `- [ ] 500 responses on attack cases replaced with 4xx`,
    `- [ ] Rate limiting / DDoS protection active (observe 429 in burst)`,
    `- [ ] Security response headers present (HSTS, X-Content-Type-Options)`,
    `- [ ] Re-run with --mode=prod against production before go-live`,
  ];

  const mdPath = path.join(outDir, `van-vapt-${ts}.md`);
  fs.writeFileSync(mdPath, mdLines.join('\n'), 'utf8');

  // Latest symlink (overwrite)
  const latestJsonPath = path.join(outDir, 'van-vapt-latest.json');
  const latestMdPath = path.join(outDir, 'van-vapt-latest.md');
  fs.writeFileSync(latestJsonPath, JSON.stringify(report, null, 2), 'utf8');
  fs.writeFileSync(latestMdPath, mdLines.join('\n'), 'utf8');

  console.log('\n====================================================');
  console.log(' VAPT COMPLETE');
  console.log('====================================================');
  console.log(` Total: ${report.totals.total} | Passed: ${passedCount} | Failed: ${failedCount}`);
  console.log(` CRITICAL: ${criticalFindings.length} | HIGH: ${highFindings.length} | MEDIUM: ${mediumFindings.length} | Observations: ${observations.length}`);
  console.log(` Rate limit 429s: ${rate429}/${burstCount}`);
  console.log(` DB delta: ${dbDelta}`);
  console.log(`\n JSON: ${jsonPath}`);
  console.log(` MD:   ${mdPath}`);
  console.log(` Latest: ${latestMdPath}`);

  if (failedCount > 0 || findings.length > 0) process.exitCode = 2;
}

run().catch((err) => {
  console.error('Fatal VAPT runner error:', err);
  process.exit(1);
});
