/**
 * VAN (Virtual Account Number) API Client for Axis Bank validation and posting.
 * Used by E2E tests to call VAN validation and posting APIs with HMAC-SHA256 signatures.
 *
 * Payload format for signature: METHOD + PATH + JSON_BODY + TIMESTAMP (no separators).
 * Path for signature: /axis-bank-validation or /axis-bank-posting (without /functions/v1).
 *
 * Reference: Signature Utility.html, Test Cases - VAN.csv
 */

import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

/** Request body fields for VAN validation (Axis Bank format) */
export interface VANValidationPayload {
  Req_type: string;
  Tran_id: string;
  Req_date: string;
  UTR: string;
  Bene_acc_no: string;
  Corp_code?: string;
  Txn_amnt: string;
  Pmode: string;
  Sndr_acnt: string;
  Sndr_ifsc: string;
  Sndr_nm: string;
  [key: string]: string | undefined;
}

/** Same shape for posting; Req_type must be 'notification' for posting */
export type VANPostingPayload = Omit<VANValidationPayload, 'Req_type'> & { Req_type: 'notification' };

export interface VANApiResponse {
  Stts_flg?: string;
  Err_cd?: string;
  message?: string;
  status?: string;
  error_code?: string;
  timestamp?: string;
  debug?: unknown;
  [key: string]: unknown;
}

export interface VANApiResult {
  success: boolean;
  status: number;
  statusText: string;
  data: VANApiResponse;
  duration?: number;
  error?: string;
}

function getConfig(): { baseUrl: string; apiKey: string; sharedSecret: string } {
  const baseUrl = process.env.VAN_API_BASE_URL || 'https://api-staging.daee.in';
  const apiKey = process.env.VAN_API_KEY || '';
  const sharedSecret = process.env.VAN_SHARED_SECRET || '';
  return { baseUrl, apiKey, sharedSecret };
}

/**
 * Build payload string for HMAC: METHOD + PATH + JSON_BODY + TIMESTAMP (no separators).
 * Body must be minified (no extra spaces/newlines).
 */
function buildPayloadString(method: string, signaturePath: string, body: string, timestamp: number): string {
  return `${method}${signaturePath}${body}${timestamp}`;
}

/**
 * Generate HMAC-SHA256 signature (lowercase hex).
 */
function generateHMACSignature(secret: string, message: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(message);
  return hmac.digest('hex').toLowerCase();
}

/**
 * Call Axis Bank validation API.
 * Endpoint: POST /functions/v1/axis-bank-validation
 * Req_type in body must be 'validation'.
 * @param signatureOverride - If provided, use this as X-Signature (e.g. for invalid-signature tests).
 */
export async function validatePayment(
  payload: VANValidationPayload,
  signatureOverride?: string
): Promise<VANApiResult> {
  const { baseUrl, apiKey, sharedSecret } = getConfig();
  if (!apiKey || !sharedSecret) {
    return {
      success: false,
      status: 0,
      statusText: '',
      data: {},
      error: 'VAN_API_KEY and VAN_SHARED_SECRET must be set in .env.local',
    };
  }

  const bodyObj = { ...payload, Req_type: 'validation' };
  const body = JSON.stringify(bodyObj);
  const timestamp = Math.floor(Date.now() / 1000);
  const method = 'POST';
  const signaturePath = '/axis-bank-validation';
  const payloadString = buildPayloadString(method, signaturePath, body, timestamp);
  const signature =
    signatureOverride !== undefined ? signatureOverride : generateHMACSignature(sharedSecret, payloadString);

  const url = `${baseUrl}/functions/v1/axis-bank-validation`;
  const start = Date.now();

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
        'X-Timestamp': timestamp.toString(),
        'X-Signature': signature,
      },
      body,
    });

    const duration = Date.now() - start;
    const data = (await response.json()) as VANApiResponse;

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data,
      duration,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      status: 0,
      statusText: '',
      data: {},
      duration: Date.now() - start,
      error,
    };
  }
}

/**
 * Call Axis Bank posting API.
 * Endpoint: POST /functions/v1/axis-bank-posting
 * Req_type in body must be 'notification'.
 */
export async function postPayment(payload: VANPostingPayload): Promise<VANApiResult> {
  const { baseUrl, apiKey, sharedSecret } = getConfig();
  if (!apiKey || !sharedSecret) {
    return {
      success: false,
      status: 0,
      statusText: '',
      data: {},
      error: 'VAN_API_KEY and VAN_SHARED_SECRET must be set in .env.local',
    };
  }

  const bodyObj = { ...payload, Req_type: 'notification' };
  const body = JSON.stringify(bodyObj);
  const timestamp = Math.floor(Date.now() / 1000);
  const method = 'POST';
  const signaturePath = '/axis-bank-posting';
  const payloadString = buildPayloadString(method, signaturePath, body, timestamp);
  const signature = generateHMACSignature(sharedSecret, payloadString);

  const url = `${baseUrl}/functions/v1/axis-bank-posting`;
  const start = Date.now();

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
        'X-Timestamp': timestamp.toString(),
        'X-Signature': signature,
      },
      body,
    });

    const duration = Date.now() - start;
    const data = (await response.json()) as VANApiResponse;

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data,
      duration,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      status: 0,
      statusText: '',
      data: {},
      duration: Date.now() - start,
      error,
    };
  }
}

/**
 * Build a fresh validation payload with unique UTR/Tran_id (timestamp-based).
 */
export function buildValidationPayload(overrides: Partial<VANValidationPayload> = {}): VANValidationPayload {
  const now = Date.now();
  const today = new Date().toISOString().split('T')[0];
  const ts = Math.floor(now / 1000);
  return {
    Req_type: 'validation',
    Tran_id: `AUTO_QA_${ts}_VAN`,
    Req_date: today,
    UTR: `AUTO_QA_${ts}_UTR`,
    Bene_acc_no: 'IACS1234',
    Corp_code: 'IACS',
    Txn_amnt: '5000.00',
    Pmode: 'NEFT',
    Sndr_acnt: '1122334455',
    Sndr_ifsc: 'HDFC0009307',
    Sndr_nm: 'AUTO_QA Test Dealer',
    ...overrides,
  };
}

/** Signature Utility test case IDs (TC_ABP_*) mapped to payload overrides for E2E parity. */
export const VAN_TEST_CASE_OVERRIDES: Record<string, Partial<VANValidationPayload>> = {
  TC_ABP_01: { Bene_acc_no: 'IACS1234', Corp_code: 'IACS', Txn_amnt: '10000.00' },
  TC_ABP_05: { Bene_acc_no: 'IACS1234', Corp_code: 'IACS', Txn_amnt: '5000.00' },
  TC_ABP_14: { Bene_acc_no: 'IACS1234', Corp_code: 'IACS', Txn_amnt: '11800.00', Sndr_nm: 'EPD TEST DEALER' },
  TC_ABP_15: { Bene_acc_no: 'IACS1234', Corp_code: 'IACS', Txn_amnt: '11800.00', Sndr_nm: 'EPD TEST DEALER' },
};

/**
 * Get payload overrides for a Signature Utility test case ID (e.g. TC_ABP_05, TC_ABP_14).
 * Use with buildValidationPayload: buildValidationPayload(getPayloadOverridesForTestCase('TC_ABP_14')).
 */
export function getPayloadOverridesForTestCase(
  testCaseId: string
): Partial<VANValidationPayload> {
  return VAN_TEST_CASE_OVERRIDES[testCaseId] ?? {};
}
