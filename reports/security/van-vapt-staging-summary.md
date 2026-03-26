# VAN API Security Assessment — Developer Briefing

**Prepared by**: QA / Security Engineering (Testra)
**Date**: 21 March 2026
**Environment Tested**: Staging (`https://api-staging.daee.in`)
**Endpoints Assessed**:
- `POST /functions/v1/axis-bank-validation`
- `POST /functions/v1/axis-bank-posting`
**Full Report**: `reports/security/van-vapt-latest.md`

---

## 1. Executive Summary

An in-house Vulnerability Assessment and Penetration Test (VAPT) was conducted against the two VAN payment API endpoints before their production enablement. The assessment ran **47 automated attack cases** across 8 security categories covering authentication, HMAC integrity, replay prevention, input validation, business logic, and rate limiting.

**The endpoints must not be enabled for production in their current state.**

| Metric | Result |
|---|---|
| Total test cases | 47 |
| Passed | 37 (79%) |
| Failed | 10 (21%) |
| CRITICAL findings | 2 |
| HIGH findings | 8 |
| Hardening observations | 17 |
| DB rows written by attack traffic | 14 (expected ≤ 3) |
| Rate limit enforcement | Not active (0 of 30 burst requests throttled) |

---

## 2. What Passed (Strengths)

The following security controls are working correctly and do **not** require changes:

| Category | Controls Verified |
|---|---|
| Authentication | Missing / invalid / empty API key correctly rejected with `401` |
| HMAC Integrity | Missing, empty, gibberish, wrong-path, and MD5 signatures all rejected with `401` |
| Body tamper | Signed body with modified amount, modified VAN, or modified posting body all rejected with `401` |
| Timestamp/Replay | Stale (10 min, 1 day old), future, and missing timestamps all rejected with `401` |
| Duplicate posting | Duplicate UTR replay and exact signed-packet replay both rejected with `400` |
| Business logic | Post-without-validation, wrong `Req_type`, cross-tenant VAN mismatch, unknown VAN, mismatched UTR all rejected with `400` |
| Amount validation | Zero, negative, and extreme amounts all correctly rejected |
| Required fields | Missing `UTR` and missing `Txn_amnt` both correctly rejected |

These represent a strong foundation. The HMAC signing and authentication layers are well-implemented.

---

## 3. Findings — Action Required Before Production

### CRITICAL — Must Fix

---

#### CRIT-1: Past `Req_date` accepted (F6)
**Endpoint**: `/axis-bank-validation`

**What happened**: A request with `Req_date` set 30 days in the past was submitted. The API accepted it with `200 Success`.

**Risk**: An attacker who captures or reconstructs a past valid payload can replay it indefinitely if only the timestamp header is rotated. There is no freshness check on the business-level date field. For a payment API, replaying a 30-day-old transaction date is a serious financial integrity violation.

**Fix required**:
```typescript
const reqDate = new Date(body.Req_date);
const today = new Date();
const diffDays = (today.getTime() - reqDate.getTime()) / (1000 * 60 * 60 * 24);
if (diffDays > 1 || diffDays < 0) {
  return errorResponse(400, 'Req_date must be today or yesterday');
}
```

---

#### CRIT-2: Attack traffic wrote 14 rows to `van_payment_collections` (DB side-effect)
**Endpoint**: `/axis-bank-validation`

**What happened**: The VAPT harness expected at most 3 DB rows to be created (from the two intentional positive-control tests). The actual count was **14** — meaning 11 rows were created by attack payloads that should have been rejected.

**Root cause**: The HIGH findings below (D2, D3, E1–E3, E8–E10, F6) all returned `200 Success`, meaning the API proceeded to write those records to the database. Injection strings including SQL syntax, XSS payloads, null bytes, and a 10KB oversized string are now stored in your payments table.

**Risk**:
- Financial ledger contains invalid / synthetic payment records
- SQL/XSS strings in the database are a secondary injection risk if read and rendered by downstream services without sanitisation
- Audit trail and reconciliation are compromised

**Fix**: Fix the HIGH findings below. Once those requests are correctly rejected, they never reach the DB write path and this delta returns to the expected ≤ 3.

---

### HIGH — Must Fix

---

#### HIGH-1 & HIGH-2: Wrong `Content-Type` accepted (D2, D3)
**Affected cases**: `text/plain` and `application/x-www-form-urlencoded`

**What happened**: Requests sent with non-JSON content types were accepted with `200 Success`. The API does not enforce `Content-Type: application/json`.

**Risk**:
- A browser can submit a `form-urlencoded` POST to this endpoint as a **simple cross-origin request** — no CORS preflight is triggered, enabling CSRF attacks against the payment validation endpoint
- WAF and API gateway JSON-inspection rules do not apply to non-JSON content-type traffic, allowing attackers to bypass inspection layers

**Fix** (one change closes both D2 and D3):
```typescript
const contentType = req.headers.get('content-type') || '';
if (!contentType.includes('application/json')) {
  return new Response(
    JSON.stringify({ message: 'Unsupported Media Type' }),
    { status: 415, headers: { 'Content-Type': 'application/json' } }
  );
}
```

---

#### HIGH-3: SQL injection string in `UTR` field accepted (E1)
**What happened**: `UTR = "' OR '1'='1"` was submitted and returned `200 Success`. The value was stored in the database.

**Risk**: If the stored UTR is later used in a raw SQL query anywhere in the codebase, it becomes a second-order SQL injection. Even parameterised queries downstream do not mitigate data that was accepted and stored at the entry point.

**Fix**: Validate `UTR` at entry — must match `^[A-Za-z0-9_-]{1,50}$` (or your agreed UTR format). Reject with `400` if it does not match.

---

#### HIGH-4: NoSQL/JSON injection in `Sndr_nm` accepted (E2)
**What happened**: `Sndr_nm = '{"$gt": ""}` was accepted with `200 Success`.

**Risk**: If any downstream service uses MongoDB or a JSON-aware query engine and reads `Sndr_nm` directly, this is a live injection vector.

**Fix**: Validate `Sndr_nm` — must be a plain string, max 100 characters, no JSON structure characters `{}[]$`.

---

#### HIGH-5: XSS payload in `Sndr_nm` accepted (E3)
**What happened**: `Sndr_nm = '<script>alert(1)</script>'` was accepted and stored in the DB.

**Risk**: Any UI that displays the sender name from the database without HTML escaping will execute the script in the user's browser. This is a stored XSS vulnerability.

**Fix**: Same fix as E2 — validate and sanitise `Sndr_nm` at the API entry point. Strip or reject HTML tags.

---

#### HIGH-6: `UTR` accepted as a JSON array (E8 — type confusion)
**What happened**: `"UTR": ["a", "b", "c"]` (an array instead of a string) was submitted and returned `200 Success`.

**Risk**: Type confusion vulnerabilities lead to unexpected behaviour in downstream processing — string operations on an array can cause crashes, bypass length limits, or produce malformed records. This also suggests the input schema is not being validated against expected types.

**Fix**: Validate that `UTR` is a `string`. Reject with `400` if it is an array, number, object, or null.

---

#### HIGH-7: Null byte in `UTR` accepted (E9)
**What happened**: `UTR = "VAPT_xxx\x00INJECTED"` was accepted. The null byte `\x00` terminates strings in C-based libraries and some DB drivers.

**Risk**: Null byte injection can truncate strings in unexpected ways, bypass string length checks, or corrupt database records depending on the driver and storage engine in use.

**Fix**: Reject any string field that contains control characters or null bytes. Add this to a shared input sanitiser:
```typescript
if (/[\x00-\x1F\x7F]/.test(value)) {
  return errorResponse(400, 'Invalid characters in field');
}
```

---

#### HIGH-8: Oversized 10KB payload accepted (E10)
**What happened**: A request with a 10,000-character `Sndr_nm` field was accepted with `200 Success`.

**Risk**: No payload size limit means the API is open to request flooding and memory exhaustion. An attacker can send thousands of max-size requests to degrade service or exhaust database storage.

**Fix**: Enforce a maximum request body size (recommended: 4KB for this endpoint) at the gateway or function level:
```typescript
const MAX_BODY_BYTES = 4096;
if (req.headers.get('content-length') > MAX_BODY_BYTES) {
  return errorResponse(413, 'Payload Too Large');
}
```
Also enforce per-field max lengths (e.g. `Sndr_nm` max 100 chars, `UTR` max 50 chars).

---

## 4. Hardening Observations (Not Blockers, But Required Before Production)

These did not constitute security bypasses but represent quality and hardening gaps that must be addressed:

| Ref | Issue | Recommended Fix |
|---|---|---|
| OBS-1 | Empty body and non-JSON body return `500` instead of `400` | Add try/catch around body parsing; return `400 Bad Request` on parse failure |
| OBS-2 | Type confusion on `Txn_amnt` (object instead of string) returns `500` | Same as OBS-1 — validate field types before processing |
| OBS-3 | Malformed JSON body returns `500` | Same as OBS-1 |
| OBS-4 | Error responses for auth failures contain the word "key" or "secret" | Sanitise error messages — return generic "Unauthorised" with no field names |
| OBS-5 | Missing `X-Content-Type-Options: nosniff` response header | Add to all responses; prevents MIME-type sniffing attacks |
| OBS-6 | Missing `X-Frame-Options` / `Content-Security-Policy` response header | Add to all responses |
| OBS-7 | Missing `Strict-Transport-Security` (HSTS) response header | Add `Strict-Transport-Security: max-age=31536000; includeSubDomains` |
| OBS-8 | No rate limiting — 30 consecutive requests received no `429` response | Enable rate limiting at API gateway or Supabase Edge Function level (recommend 20 req/min per API key) |

---

## 5. Recommended Fix Priority and Owner

| Priority | Finding | Owner | Effort |
|---|---|---|---|
| P0 — Block prod | CRIT-2: Injection strings in DB | Backend / Edge Function | Medium |
| P0 — Block prod | CRIT-1: Past `Req_date` accepted | Backend / Edge Function | Low |
| P0 — Block prod | HIGH-1/2: Content-Type not enforced | Backend / Edge Function | Low (1 guard) |
| P0 — Block prod | HIGH-3: SQL injection accepted | Backend / Edge Function | Low (regex validation) |
| P0 — Block prod | HIGH-4: NoSQL injection accepted | Backend / Edge Function | Low (field sanitiser) |
| P0 — Block prod | HIGH-5: XSS payload stored in DB | Backend / Edge Function | Low (field sanitiser) |
| P0 — Block prod | HIGH-6: Type confusion on UTR | Backend / Edge Function | Low (schema validation) |
| P0 — Block prod | HIGH-7: Null byte injection | Backend / Edge Function | Low (control char check) |
| P0 — Block prod | HIGH-8: No payload size limit | API Gateway / Edge Function | Low |
| P1 — Before prod | OBS-1/2/3: 500 on bad input | Backend / Edge Function | Low |
| P1 — Before prod | OBS-4: Error message leakage | Backend / Edge Function | Low |
| P1 — Before prod | OBS-5/6/7: Security headers | API Gateway / Edge Function | Low |
| P1 — Before prod | OBS-8: Rate limiting | Infrastructure / API Gateway | Medium |

---

## 6. Suggested Shared Input Validator

All P0 findings in the E category can be resolved with a single shared validation function applied to every string field at the start of the handler.

---

## 7. Re-Test Plan

Once fixes are deployed to staging, re-run the VAPT suite:

```bash
# Full re-test on staging
npm run test:vapt:van

# Expected result after fixes:
# Total: 47 | Passed: 47 | Failed: 0
# CRITICAL: 0 | HIGH: 0
# DB delta: <= 3
# 500 responses on bad input: 0
```

Once staging achieves a clean pass, run the production-safe (non-state-changing) mode against production:

```bash
# Production VAPT (attack-only, no state changes)
npm run test:vapt:van:prod
```

**Production go-live gate**: All CRITICAL and HIGH findings must be resolved and verified on staging before this command is run against production.

---

## 8. Appendix — What Was Not Tested (Scope Boundaries)

The following are out of scope for this in-house assessment and should be covered in a formal external pentest before any public-facing enablement:

- TLS/certificate configuration and cipher suite analysis
- Infrastructure-level network scanning (VPC, firewall rules)
- Supabase platform-level configuration (Row Level Security policies)
- Long-duration fuzzing (this assessment used targeted known-pattern cases only)
- Social engineering and credential phishing vectors

---

*Full machine-readable results including all 47 case payloads and responses are available in `reports/security/van-vapt-latest.json`.*
*This document should be read alongside `reports/security/van-vapt-latest.md`.*
