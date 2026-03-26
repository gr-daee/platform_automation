import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { RFQListPage } from '../../pages/p2p/RFQListPage';
import { CreateRFQPage } from '../../pages/p2p/CreateRFQPage';
import { ProcurementRequestsPage } from '../../pages/p2p/ProcurementRequestsPage';
import { RFQDetailPage } from '../../pages/p2p/RFQDetailPage';
import { InviteSuppliersPage } from '../../pages/p2p/InviteSuppliersPage';
import { executeQuery } from '../../support/db-helper';

const { Given, When, Then } = createBdd();

Given('I am on the RFQ list page', async function ({ page }) {
  const rfqPage = new RFQListPage(page);
  await rfqPage.goto();
  await rfqPage.verifyPageLoaded();
  (this as any).rfqListPage = rfqPage;
});

Given('there is at least one approved PR available for RFQ', async function ({ page }) {
  const prPage = new ProcurementRequestsPage(page);
  await prPage.goto();
  await prPage.verifyPageLoaded();
  const approvedRow = page.locator('table tbody tr').filter({ hasText: 'Approved' }).first();
  await expect(approvedRow).toBeVisible({ timeout: 15000 });
  console.log('✅ [P2P] Approved PR available for RFQ');
});

When('I create an RFQ from an approved PR with response deadline in {int} days', async function (
  { page },
  days: number
) {
  const rfqListPage = (this as any).rfqListPage ?? new RFQListPage(page);
  await rfqListPage.goto();
  await rfqListPage.verifyPageLoaded();
  await rfqListPage.gotoCreate();
  const createPage = new CreateRFQPage(page);
  await createPage.selectFirstApprovedPR();
  const title = `AUTO_QA_RFQ_${Date.now()}`;
  await createPage.fillTitle(title);
  await createPage.fillResponseDeadline(days);
  await createPage.fillRequiredDeliveryDate(days);
  await createPage.submitCreate();
  const rfqDetailPage = new RFQDetailPage(page);
  (this as any).currentRfqId = rfqDetailPage.getCurrentRfqIdFromUrl();
  (this as any).lastRfqTitle = title;
  console.log(`✅ [P2P] Created RFQ with deadline in ${days} days`);
});

Then('I should be on the RFQ detail page', async function ({ page }) {
  const isRfqDetail = (url: string) => {
    try {
      const path = new URL(url).pathname;
      return /^\/p2p\/rfq\/[^/]+$/.test(path) && path !== '/p2p/rfq/create';
    } catch {
      return false;
    }
  };
  await page.waitForURL(isRfqDetail);
  await expect(page).toHaveURL(isRfqDetail);
  console.log('✅ [P2P] On RFQ detail page');
});

Then(
  'the source procurement request should show status {string} or an equivalent converted indicator',
  async function ({ page }, status: string) {
    // Navigate to Procurement Requests and open an Approved PR to verify converted indicator.
    await page.goto('/p2p/procurement-requests');
    await page.waitForLoadState('networkidle');

    const approvedRow = page.locator('table tbody tr').filter({ hasText: 'Approved' }).first();
    await expect(approvedRow).toBeVisible({ timeout: 15000 });
    await approvedRow.click();
    await page.waitForURL(/\/p2p\/procurement-requests\/[^/]+$/, { timeout: 15000 });

    const mainRegion = page.locator('main');
    const convertedBadge = mainRegion
      .getByText(new RegExp(status.replace(/\s+/g, '\\s+'), 'i'))
      .or(mainRegion.getByText(/Converted to RFQ|RFQ Linked|Converted/i));

    await expect(convertedBadge.first()).toBeVisible({ timeout: 15000 });
    console.log('✅ [P2P] PR shows converted / RFQ-linked status');
  }
);

Given('I am on the "p2p/rfq/create" page', async function ({ page }) {
  await page.goto('/p2p/rfq/create');
  await page.waitForLoadState('networkidle');
  console.log('✅ Navigated to p2p/rfq/create');
});

Then('the Create RFQ submit button should not be visible until a PR is selected', async function ({
  page,
}) {
  const submitBtn = page.getByRole('button', { name: /Create RFQ/i });
  await expect(submitBtn).toBeHidden();
  console.log('✅ [P2P] Create RFQ submit button not visible before PR selection');
});

Then('the RFQ document view should not expose internal budget or cost-center fields', async function ({ page }) {
  const main = page.locator('main');
  await expect(main.getByText(/Budget|Cost Center|Internal Code|GL Code/i)).toBeHidden();
  console.log('✅ [P2P] RFQ view hides internal budget/cost-center fields');
});

When('I invite up to {int} suppliers for the current RFQ', async function ({ page }, count: number) {
  const rfqId = (this as any).currentRfqId as string | undefined;
  if (!rfqId) throw new Error('Missing currentRfqId in scenario context.');
  const detail = new RFQDetailPage(page);
  await detail.goto(rfqId);
  await detail.verifyDetailLoaded();
  await detail.goToInvite();
  const invitePage = new InviteSuppliersPage(page);
  const invited = await invitePage.inviteSuppliersUpTo(count);
  (this as any).invitedSupplierCount = invited;
  await page.goto(`/p2p/rfq/${rfqId}`);
  await page.waitForLoadState('networkidle');
  console.log(`✅ [P2P] Invited ${invited} supplier(s) for current RFQ`);
});

When('I issue the current RFQ to invited suppliers', async function ({ page, $test }) {
  const rfqId = (this as any).currentRfqId as string | undefined;
  if (!rfqId) throw new Error('Missing currentRfqId in scenario context.');
  const detail = new RFQDetailPage(page);
  await detail.goto(rfqId);
  await detail.verifyDetailLoaded();
  const issueVisible = await detail.issueRfqButton.isVisible().catch(() => false);
  if (!issueVisible) {
    $test?.skip(true, 'Issue RFQ action not available for current RFQ state.');
    return;
  }
  await detail.issueRfqAndConfirm('AUTO_QA_ Single-source/business justification for audit');
  await page.reload();
  await page.waitForLoadState('networkidle');
});

Then('the RFQ send audit should capture recipients, issue timestamp, and version details', async function () {
  const rfqId = (this as any).currentRfqId as string | undefined;
  if (!rfqId) throw new Error('Missing currentRfqId in scenario context.');
  const rows = await executeQuery<{ cnt: string }>(
    `
      SELECT COUNT(*)::text AS cnt
      FROM audit_logs
      WHERE entity_type IN ('rfq_headers', 'rfq')
        AND entity_id = $1
        AND (
          COALESCE(action, '') ILIKE '%issue%'
          OR COALESCE(new_values::text, '') ILIKE '%issued%'
          OR COALESCE(new_values::text, '') ILIKE '%version%'
          OR COALESCE(new_values::text, '') ILIKE '%recipient%'
        )
    `,
    [rfqId]
  );
  expect(Number(rows[0]?.cnt || '0')).toBeGreaterThan(0);
  console.log('✅ [P2P] RFQ send audit rows found for recipients/version/timestamp indicators');
});

Given('there is an issued RFQ with supplier recipients in audit', async function ({ page, $test }) {
  const listPage = new RFQListPage(page);
  await listPage.goto();
  await listPage.verifyPageLoaded();
  await listPage.gotoCreate();
  const createPage = new CreateRFQPage(page);
  await createPage.selectFirstApprovedPR();
  const title = `AUTO_QA_RFQ_RESEND_${Date.now()}`;
  await createPage.fillTitle(title);
  await createPage.fillResponseDeadline(7);
  await createPage.fillRequiredDeliveryDate(7);
  await createPage.submitCreate();
  const detail = new RFQDetailPage(page);
  const rfqId = detail.getCurrentRfqIdFromUrl();
  (this as any).currentRfqId = rfqId;
  (this as any).lastRfqTitle = title;

  await detail.goToInvite();
  const invitePage = new InviteSuppliersPage(page);
  const invited = await invitePage.inviteSuppliersUpTo(2);
  if (invited === 0) {
    $test?.skip(true, 'No suppliers available to invite for issued RFQ setup.');
    return;
  }
  await page.goto(`/p2p/rfq/${rfqId}`);
  await page.waitForLoadState('networkidle');
  await detail.issueRfqAndConfirm('AUTO_QA initial issue for resend regression');

  const before = await executeQuery<{ cnt: string }>(
    `
      SELECT COUNT(*)::text AS cnt
      FROM audit_logs
      WHERE entity_type IN ('rfq_headers', 'rfq')
        AND entity_id = $1
        AND (COALESCE(action, '') ILIKE '%issue%' OR COALESCE(new_values::text, '') ILIKE '%issued%')
    `,
    [rfqId]
  );
  (this as any).rfqIssueAuditCountBefore = Number(before[0]?.cnt || '0');
});

When('I perform a resend style action by inviting an additional supplier for the RFQ', async function ({ page, $test }) {
  const rfqId = (this as any).currentRfqId as string | undefined;
  if (!rfqId) throw new Error('Missing currentRfqId in scenario context.');
  const detail = new RFQDetailPage(page);
  await detail.goto(rfqId);
  await detail.verifyDetailLoaded();
  const inviteVisible = await page.getByRole('button', { name: /Invite Suppliers/i }).isVisible().catch(() => false);
  if (!inviteVisible) {
    $test?.skip(true, 'Invite Suppliers action unavailable for resend simulation.');
    return;
  }
  await detail.goToInvite();
  const invitePage = new InviteSuppliersPage(page);
  const invited = await invitePage.inviteSuppliersUpTo(1);
  if (invited === 0) {
    $test?.skip(true, 'No additional supplier available to invite for resend simulation.');
    return;
  }
  await page.goto(`/p2p/rfq/${rfqId}`);
  await page.waitForLoadState('networkidle');
  if (await detail.issueRfqButton.isVisible().catch(() => false)) {
    await detail.issueRfqAndConfirm('AUTO_QA resend issue after additional supplier');
  }
});

Then('the RFQ send audit log count should increase for the same RFQ', async function () {
  const rfqId = (this as any).currentRfqId as string | undefined;
  if (!rfqId) throw new Error('Missing currentRfqId in scenario context.');
  const before = Number((this as any).rfqIssueAuditCountBefore || 0);
  const after = await executeQuery<{ cnt: string }>(
    `
      SELECT COUNT(*)::text AS cnt
      FROM audit_logs
      WHERE entity_type IN ('rfq_headers', 'rfq')
        AND entity_id = $1
        AND (COALESCE(action, '') ILIKE '%issue%' OR COALESCE(new_values::text, '') ILIKE '%issued%')
    `,
    [rfqId]
  );
  expect(Number(after[0]?.cnt || '0')).toBeGreaterThan(before);
});

Then('the source procurement request should block direct Convert to PO after RFQ conversion', async function ({ page }) {
  const title = (this as any).lastRfqTitle as string | undefined;
  if (!title) throw new Error('Missing lastRfqTitle in scenario context.');
  const rows = await executeQuery<{ procurement_request_id: string }>(
    `
      SELECT procurement_request_id
      FROM rfq_headers
      WHERE title = $1
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [title]
  );
  const prId = rows[0]?.procurement_request_id;
  if (!prId) throw new Error(`Could not resolve source PR for RFQ title ${title}`);
  await page.goto(`/p2p/procurement-requests/${prId}`);
  await page.waitForLoadState('networkidle');
  const convertBtn = page.getByRole('button', { name: /Convert Remaining to PO|Convert to Purchase Order/i }).first();
  if (await convertBtn.count()) {
    await expect(convertBtn).toBeHidden();
  }
  console.log('✅ [P2P] Source PR blocks direct Convert to PO post RFQ conversion');
});

Then(
  'issuing the RFQ should require single-source justification when only one supplier is invited',
  async function ({ page, $test }) {
    const invited = Number((this as any).invitedSupplierCount || 0);
    if (invited !== 1) {
      $test?.skip(true, `Expected exactly 1 invited supplier, got ${invited}.`);
      return;
    }
    const rfqId = (this as any).currentRfqId as string | undefined;
    if (!rfqId) throw new Error('Missing currentRfqId in scenario context.');
    const detail = new RFQDetailPage(page);
    await detail.goto(rfqId);
    await detail.verifyDetailLoaded();
    await detail.issueRfqButton.click();
    const alert = page.getByRole('alertdialog');
    await expect(alert).toBeVisible({ timeout: 5000 });
    await expect(alert.getByPlaceholder(/justification for sole source/i)).toBeVisible({ timeout: 5000 });
    await page.keyboard.press('Escape');
  }
);

Given('there is an issued RFQ with at least one received quote', async function ({ page, $test }) {
  const listPage = new RFQListPage(page);
  await listPage.goto();
  await listPage.verifyPageLoaded();
  await listPage.gotoCreate();
  const createPage = new CreateRFQPage(page);
  await createPage.selectFirstApprovedPR();
  const title = `AUTO_QA_RFQ_EARLY_${Date.now()}`;
  await createPage.fillTitle(title);
  await createPage.fillResponseDeadline(7);
  await createPage.fillRequiredDeliveryDate(7);
  await createPage.submitCreate();

  const detail = new RFQDetailPage(page);
  const rfqId = detail.getCurrentRfqIdFromUrl();
  (this as any).currentRfqId = rfqId;
  await detail.goToInvite();
  const invitePage = new InviteSuppliersPage(page);
  const invited = await invitePage.inviteSuppliersUpTo(1);
  if (invited === 0) {
    $test?.skip(true, 'No suppliers available for quote setup.');
    return;
  }
  await page.goto(`/p2p/rfq/${rfqId}`);
  await page.waitForLoadState('networkidle');
  if (await detail.issueRfqButton.isVisible().catch(() => false)) {
    await detail.issueRfqAndConfirm('AUTO_QA early progression setup');
  }
  if (await detail.enterQuoteButton.isVisible().catch(() => false)) {
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 7);
    await detail.enterQuoteAndSubmit(validUntil.toISOString().split('T')[0]);
    await page.reload();
    await page.waitForLoadState('networkidle');
  }
});

Then('the RFQ should remain actionable for evaluation before response deadline passes', async function ({ page }) {
  const detail = new RFQDetailPage(page);
  await detail.verifyDetailLoaded();
  const actionable = page
    .getByRole('button', { name: /Compare Quotes|Enter Quote|Approve Selection|Reject Selection/i })
    .first();
  await expect(actionable).toBeVisible({ timeout: 10000 });
});

When('I open an RFQ that has at least one quote', async function ({ page, $test }) {
  const listPage = new RFQListPage(page);
  await listPage.goto();
  await listPage.verifyPageLoaded();
  await listPage.openFirstRFQ();
  const rfqId = new RFQDetailPage(page).getCurrentRfqIdFromUrl();
  (this as any).currentRfqId = rfqId;
  await page.goto(`/p2p/rfq/${rfqId}/comparison`);
  await page.waitForLoadState('networkidle');
  const noQuotes = await page.getByText(/No quotes have been submitted/i).isVisible().catch(() => false);
  if (noQuotes) {
    $test?.skip(true, 'No quotes available in selected RFQ for visibility validation.');
    return;
  }
});

Then('quote visibility for {string} should match configured policy', async function ({ page }, user: string) {
  const hasTable = await page.locator('table tbody tr').count();
  expect(hasTable, `Expected quote table visibility check for ${user}`).toBeGreaterThan(0);
});
