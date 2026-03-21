# VAN API VAPT Report

| Field | Value |
|---|---|
| Executed At | 2026-03-21T14:56:40.901Z |
| Mode | full (staging) |
| Environment | https://api-staging.daee.in |
| Total Cases | 47 |
| Passed | 37 |
| Failed | 10 |
| CRITICAL Findings | 2 |
| HIGH Findings | 8 |
| MEDIUM Findings | 0 |
| Observations | 17 |
| Rate Limit 429s in 30-req burst | 0 |
| DB Side Effect Delta | 14 |

## Security Findings

### [HIGH] D2 Validation wrong content-type (text/plain)
- **Category**: D
- **Issue**: Attack case was accepted unexpectedly — security control missing or bypassed
- **HTTP Status**: 200
- **Response**: `{"Stts_flg":"S","Err_cd":"000","message":"Success"}`

### [HIGH] D3 Validation form-urlencoded content-type
- **Category**: D
- **Issue**: Attack case was accepted unexpectedly — security control missing or bypassed
- **HTTP Status**: 200
- **Response**: `{"Stts_flg":"S","Err_cd":"000","message":"Success"}`

### [HIGH] E1 Validation SQL injection in UTR
- **Category**: E
- **Issue**: Attack case was accepted unexpectedly — security control missing or bypassed
- **HTTP Status**: 200
- **Response**: `{"Stts_flg":"S","Err_cd":"000","message":"Success"}`

### [HIGH] E2 Validation NoSQL/JSON injection in Sndr_nm
- **Category**: E
- **Issue**: Attack case was accepted unexpectedly — security control missing or bypassed
- **HTTP Status**: 200
- **Response**: `{"Stts_flg":"S","Err_cd":"000","message":"Success"}`

### [HIGH] E3 Validation XSS payload in Sndr_nm
- **Category**: E
- **Issue**: Attack case was accepted unexpectedly — security control missing or bypassed
- **HTTP Status**: 200
- **Response**: `{"Stts_flg":"S","Err_cd":"000","message":"Success"}`

### [HIGH] E8 Validation type confusion - UTR as array
- **Category**: E
- **Issue**: Attack case was accepted unexpectedly — security control missing or bypassed
- **HTTP Status**: 200
- **Response**: `{"Stts_flg":"S","Err_cd":"000","message":"Success"}`

### [HIGH] E9 Validation null byte injection in UTR
- **Category**: E
- **Issue**: Attack case was accepted unexpectedly — security control missing or bypassed
- **HTTP Status**: 200
- **Response**: `{"Stts_flg":"S","Err_cd":"000","message":"Success"}`

### [HIGH] E10 Validation oversized payload (10KB body)
- **Category**: E
- **Issue**: Attack case was accepted unexpectedly — security control missing or bypassed
- **HTTP Status**: 200
- **Response**: `{"Stts_flg":"S","Err_cd":"000","message":"Success"}`

### [CRITICAL] F6 Validation with past Req_date (30 days old)
- **Category**: F
- **Issue**: Attack case was accepted unexpectedly — security control missing or bypassed
- **HTTP Status**: 200
- **Response**: `{"Stts_flg":"S","Err_cd":"000","message":"Success"}`

### [CRITICAL] DB side-effect verification
- **Category**: F
- **Issue**: Attack traffic created 14 unexpected DB rows (expected <= 3). Possible data pollution.
- **HTTP Status**: DB check
- **Response**: `{"dbDelta":14}`

## Observations (Quality / Hardening)

- [OBSERVATION] [A] A1 Validation positive control: Missing security response headers: X-Content-Type-Options, X-Frame-Options / CSP
- [OBSERVATION] [A] A2 Validation missing API key: Possible sensitive data leakage in response: key
- [OBSERVATION] [A] A3 Validation invalid API key: Possible sensitive data leakage in response: key
- [OBSERVATION] [A] A4 Validation empty API key string: Possible sensitive data leakage in response: key
- [OBSERVATION] [A] A5 Posting missing API key: Possible sensitive data leakage in response: key
- [OBSERVATION] [A] A6 Validation API key in URL (should reject): Possible sensitive data leakage in response: key
- [OBSERVATION] [B] B2 Validation invalid signature (gibberish): Possible sensitive data leakage in response: secret
- [OBSERVATION] [B] B4 Validation wrong path in signature (path swap attack): Possible sensitive data leakage in response: secret
- [OBSERVATION] [B] B5 Validation body tamper after signing (amount inflation): Possible sensitive data leakage in response: secret
- [OBSERVATION] [B] B6 Validation VAN tamper after signing (cross-tenant VAN swap): Possible sensitive data leakage in response: secret
- [OBSERVATION] [B] B8 Validation wrong HMAC algorithm (MD5 signature): Possible sensitive data leakage in response: secret
- [OBSERVATION] [D] D4 Validation empty body: Server returned 500 instead of a clean 4xx — review error handling
- [OBSERVATION] [D] D5 Validation non-JSON body: Server returned 500 instead of a clean 4xx — review error handling
- [OBSERVATION] [E] E7 Validation type confusion - amount as object: Server returned 500 instead of a clean 4xx — review error handling
- [OBSERVATION] [G] G1 OPTIONS preflight (CORS headers check): Missing security response headers: X-Content-Type-Options, X-Frame-Options / CSP
- [OBSERVATION] [G] G3 Malformed JSON triggers 500 (should be 400): Server returned 500 instead of a clean 4xx — review error handling
- [OBSERVATION] [H] H1 Rate limiting: No 429 response in 30-request burst. Consider enabling rate limiting / DDoS protection for production.

## All Case Results

| Result | Category | Case | Status | Accepted | Expected |
|---|---|---|---|---|---|
| PASS | A | A1 Validation positive control | 200 | true | true |
| PASS | A | A2 Validation missing API key | 401 | false | false |
| PASS | A | A3 Validation invalid API key | 401 | false | false |
| PASS | A | A4 Validation empty API key string | 401 | false | false |
| PASS | A | A5 Posting missing API key | 401 | false | false |
| PASS | A | A6 Validation API key in URL (should reject) | 401 | false | false |
| PASS | B | B1 Validation missing signature header | 401 | false | false |
| PASS | B | B2 Validation invalid signature (gibberish) | 401 | false | false |
| PASS | B | B3 Validation empty signature string | 401 | false | false |
| PASS | B | B4 Validation wrong path in signature (path swap attack) | 401 | false | false |
| PASS | B | B5 Validation body tamper after signing (amount inflation) | 401 | false | false |
| PASS | B | B6 Validation VAN tamper after signing (cross-tenant VAN swap) | 401 | false | false |
| PASS | B | B7 Posting body tamper after signing | 401 | false | false |
| PASS | B | B8 Validation wrong HMAC algorithm (MD5 signature) | 401 | false | false |
| PASS | C | C1 Validation stale timestamp (10 min old) | 401 | false | false |
| PASS | C | C2 Validation very old timestamp (1 day old) | 401 | false | false |
| PASS | C | C3 Validation future timestamp (1 hour ahead) | 401 | false | false |
| PASS | C | C4 Validation missing timestamp header | 401 | false | false |
| PASS | C | C5 Posting duplicate UTR replay (idempotency) | 400 | false | false |
| PASS | C | C6 Posting exact request replay (same signed packet) | 400 | false | false |
| PASS | D | D1 Validation GET request (method not allowed) | 0 | false | false |
| FAIL | D | D2 Validation wrong content-type (text/plain) | 200 | true | false |
| FAIL | D | D3 Validation form-urlencoded content-type | 200 | true | false |
| PASS | D | D4 Validation empty body | 500 | false | false |
| PASS | D | D5 Validation non-JSON body | 500 | false | false |
| FAIL | E | E1 Validation SQL injection in UTR | 200 | true | false |
| FAIL | E | E2 Validation NoSQL/JSON injection in Sndr_nm | 200 | true | false |
| FAIL | E | E3 Validation XSS payload in Sndr_nm | 200 | true | false |
| PASS | E | E4 Validation zero amount | 400 | false | false |
| PASS | E | E5 Validation negative amount | 400 | false | false |
| PASS | E | E6 Validation extremely large amount (overflow probe) | 400 | false | false |
| PASS | E | E7 Validation type confusion - amount as object | 500 | false | false |
| FAIL | E | E8 Validation type confusion - UTR as array | 200 | true | false |
| FAIL | E | E9 Validation null byte injection in UTR | 200 | true | false |
| FAIL | E | E10 Validation oversized payload (10KB body) | 200 | true | false |
| PASS | E | E11 Validation missing required field (UTR omitted) | 400 | false | false |
| PASS | E | E12 Validation missing required field (Txn_amnt omitted) | 400 | false | false |
| PASS | F | F1 Posting without prior validation | 400 | false | false |
| PASS | F | F2 Posting with wrong Req_type (validation instead of notification) | 400 | false | false |
| PASS | F | F3 Cross-tenant VAN (Corp_code mismatch) | 400 | false | false |
| PASS | F | F4 Unknown VAN (non-existent Bene_acc_no) | 400 | false | false |
| PASS | F | F5 Posting with mismatched UTR/Tran_id vs validated | 400 | false | false |
| FAIL | F | F6 Validation with past Req_date (30 days old) | 200 | true | false |
| PASS | G | G1 OPTIONS preflight (CORS headers check) | 200 | false | false |
| PASS | G | G2 HEAD request (method not allowed) | 0 | false | false |
| PASS | G | G3 Malformed JSON triggers 500 (should be 400) | 500 | false | false |
| FAIL | H | H1 Rate limiting: 30-request burst (invalid sigs) | 0/30 got 429 | false | false |

**JSON report**: `/Users/goverdhanreddygarudaiah/Documents/GitHub/daee/platform_automation/reports/security/van-vapt-2026-03-21T14-56-40-901Z.json`

## Production Readiness Checklist

- [ ] All CRITICAL/HIGH findings resolved
- [ ] 500 responses on attack cases replaced with 4xx
- [ ] Rate limiting / DDoS protection active (observe 429 in burst)
- [ ] Security response headers present (HSTS, X-Content-Type-Options)
- [ ] Re-run with --mode=prod against production before go-live