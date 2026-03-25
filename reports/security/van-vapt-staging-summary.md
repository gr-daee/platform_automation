# VAN API Security Assessment — Staging Summary (Updated)

**Prepared by**: QA / Security Engineering (Testra)  
**Date**: 23 March 2026  
**Environment Tested**: Staging (`https://api-staging.daee.in`)  
**Execution Timestamp**: `2026-03-23T09:50:13.522Z`  
**Endpoints Assessed**:
- `POST /functions/v1/axis-bank-validation`
- `POST /functions/v1/axis-bank-posting`
**Source of truth**: `reports/security/van-vapt-latest.md`

---

## 1. Executive Summary

Latest full VAPT re-run on staging shows major hardening progress.

| Metric | Result |
|---|---|
| Total test cases | 47 |
| Passed | 46 (97.9%) |
| Failed | 1 (2.1%) |
| CRITICAL findings | 1 |
| HIGH findings | 0 |
| MEDIUM findings | 0 |
| Observations | 2 |
| DB side-effect delta | 5 rows (expected <= 3) |
| Rate limiting (429 in 30-req burst) | 0 |

**Current release decision**: **Do not promote to production yet.**  
Only one blocker remains, but it is CRITICAL (unexpected DB side effects).

---

## 2. Security Posture Snapshot

### Controls that are now passing

- API key auth checks (missing/invalid/empty) are rejected.
- Signature integrity checks (missing/invalid/tampered/wrong algorithm) are rejected.
- Replay and timestamp checks are passing for tested scenarios.
- Input validation and business-logic checks are broadly enforced.
- 500-path for malformed JSON case G3 is now corrected to 400.

### Remaining failed control

- **H1 Rate limiting** still fails (0/30 requests got `429`).

---

## 3. Active Findings (From Latest Run)

### [CRITICAL] F — DB side-effect verification

- **Issue**: Attack traffic still created **5 DB rows**; expected threshold is `<= 3`.
- **Evidence**: `{"dbDelta":5}`
- **Risk**: Potential data pollution from hostile traffic despite request-level validation improvements.
- **Required action**:
  - Trace which specific cases are still creating rows.
  - Add server-side write guards so rejected/invalid paths cannot persist anything.
  - Re-run VAPT and confirm DB delta returns to `<= 3`.

### Observations (non-blocker but required hardening)

1. **E7 type confusion (`Txn_amnt` as object)** returned `500` instead of clean `4xx`.
2. **H1 rate limiting** not enforced (`0/30` throttled).

---

## 4. What Changed Since Prior Staging Report

Compared to the previous summary baseline:

- Pass rate improved from **37/47** to **46/47**.
- HIGH findings reduced from **8** to **0**.
- CRITICAL findings reduced from **2** to **1**.
- DB side-effect delta improved from **14** to **5**, but still above gate.
- Remaining gaps are now concentrated in:
  - DB write-side safety verification
  - Error handling consistency for one type-confusion case
  - Rate limiting enforcement

---

## 5. Priority Actions Before Production

| Priority | Action | Owner |
|---|---|---|
| P0 (Blocker) | Fix DB side-effect gap (`dbDelta` must be `<= 3`) | Backend / Edge Function |
| P1 | Ensure E7 returns deterministic 4xx (not 500) | Backend / Edge Function |
| P1 | Enable and verify API rate limiting (expect 429 under burst) | Infra / API Gateway |

---

## 6. Re-Test Plan

After fixes are deployed to staging:

```bash
# Full staging VAPT
npm run test:vapt:van
```

Success criteria for production sign-off:

- `CRITICAL = 0`
- `HIGH = 0`
- `DB delta <= 3`
- No 500 responses for invalid input classes
- Rate limiting produces expected 429 behavior under burst

---

## 7. Evidence Links

- Human-readable latest report: `reports/security/van-vapt-latest.md`
- Machine-readable latest report: `reports/security/van-vapt-latest.json`
