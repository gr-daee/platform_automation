# IMPL-030 - Redundant Test Cleanup (Finance Cash Receipts)

**Metadata**
- **ID**: IMPL-030
- **Date**: 2026-02-22
- **Module**: Finance (Cash Receipts, VAN)
- **Type**: Cleanup
- **Status**: Complete

---

## What Was Done

### Removed / Consolidated
- **van-fifo-allocation**: Removed FIN-VAN-TC-023 (FIFO allocation order) — redundant with van-api-posting FIN-VAN-TC-005 (same flow and assertion). Renumbered: TC-024 → FIN-VAN-TC-023 (Overpayment creates advance), TC-025 → FIN-VAN-TC-024 (No invoices creates full advance).
- **van-epd-discount**: Consolidated 4 scenarios (014–017) to 2: FIN-VAN-TC-014 (EPD discount calculated for VAN payment), FIN-VAN-TC-015 (VAN payment allocated FIFO when no EPD). Previous 014/015/017 had identical steps and data; 016 asserted FIFO. Slab-specific scenarios (7d/8–15d/30d) can be re-added later with distinct test data.

### Docs Updated
- docs/modules/finance/cash-receipts/test-cases.md: VAN EPD (2 tests), VAN FIFO (2 tests), coverage summary (23 total), IMPL-030 note.

---

## Test Count Change

| Before | After |
|--------|--------|
| VAN EPD: 4 | VAN EPD: 2 |
| VAN FIFO: 3 | VAN FIFO: 2 |
| Total priority: 27 | Total priority: 23 |

## E2E Run Note

Full regression (`npm run test:regression -- e2e/features/finance/cash-receipts/`) requires local execution: `npx playwright install`, valid .env.local credentials (IACS_MD_USER_*, VAN_API_*), and the web app running at BASE_URL (e.g. http://localhost:3000). Run locally to verify all scenarios after cleanup.
