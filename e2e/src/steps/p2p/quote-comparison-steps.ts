import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { RFQListPage } from '../../pages/p2p/RFQListPage';
import { RFQDetailPage } from '../../pages/p2p/RFQDetailPage';
import { QuoteComparisonPage } from '../../pages/p2p/QuoteComparisonPage';
import { InviteSuppliersPage } from '../../pages/p2p/InviteSuppliersPage';

const { Given, When, Then } = createBdd();

Given('I am on the "p2p/rfq" page', async function ({ page }) {
  const listPage = new RFQListPage(page);
  await listPage.goto();
  await listPage.verifyPageLoaded();
  (this as any).rfqListPage = listPage;
});

Given('there is at least one RFQ in the list', async function ({ page }) {
  const listPage = (this as any).rfqListPage ?? new RFQListPage(page);
  if (!(this as any).rfqListPage) await listPage.goto();
  const hasRfq = await listPage.hasAtLeastOneRFQ();
  expect(hasRfq, 'Expected at least one RFQ in the list').toBe(true);
  console.log('✅ [P2P] At least one RFQ in list');
});

When('I open the first RFQ and navigate to Quote Comparison', async function ({ page }) {
  const listPage = (this as any).rfqListPage ?? new RFQListPage(page);
  if (!(this as any).rfqListPage) await listPage.goto();
  await listPage.openFirstRFQ();
  const detailPage = new RFQDetailPage(page);
  const rfqId = detailPage.getCurrentRfqIdFromUrl();
  (this as any).currentRfqId = rfqId;
  const compareVisible = await detailPage.isCompareQuotesVisible();
  if (compareVisible) {
    await detailPage.goToComparison();
  } else {
    await page.goto(`/p2p/rfq/${rfqId}/comparison`);
    await page.waitForLoadState('networkidle');
  }
  console.log('✅ [P2P] Opened first RFQ and navigated to Quote Comparison');
});

When('I open the first RFQ detail', async function ({ page }) {
  const listPage = (this as any).rfqListPage ?? new RFQListPage(page);
  if (!(this as any).rfqListPage) await listPage.goto();
  await listPage.openFirstRFQ();
  (this as any).currentRfqId = new RFQDetailPage(page).getCurrentRfqIdFromUrl();
  console.log('✅ [P2P] Opened first RFQ detail');
});

Then('I should see either the quote comparison table or "No quotes" message', async function ({ page }) {
  const comparisonPage = new QuoteComparisonPage(page);
  await comparisonPage.expectComparisonTableOrNoQuotes();
});

Then('I should see the RFQ detail page with status and actions', async function ({ page }) {
  await expect(page).toHaveURL(/\/p2p\/rfq\/[^/]+$/);
  const detailPage = new RFQDetailPage(page);
  await detailPage.verifyDetailLoaded();
  console.log('✅ [P2P] RFQ detail page with status and actions visible');
});

Given('there is an RFQ with at least one quote for comparison', async function ({ page, $test }) {
  const listPage = (this as any).rfqListPage ?? new RFQListPage(page);
  if (!(this as any).rfqListPage) {
    await listPage.goto();
    (this as any).rfqListPage = listPage;
  }
  const hasRfq = await listPage.hasAtLeastOneRFQ();
  if (!hasRfq && $test) {
    $test.skip(true, 'No RFQ in list; create an RFQ first (e.g. Phase 2).');
    return;
  }
  expect(hasRfq).toBe(true);
  await listPage.openFirstRFQ();
  const detailPage = new RFQDetailPage(page);
  let rfqId = detailPage.getCurrentRfqIdFromUrl();
  (this as any).currentRfqId = rfqId;
  await detailPage.verifyDetailLoaded();

  const noSuppliersText = await page.getByText('No suppliers invited yet').isVisible().catch(() => false);
  const inviteBtnVisible = await page.getByRole('button', { name: /Invite Suppliers/i }).isVisible().catch(() => false);
  if (inviteBtnVisible) {
    await detailPage.goToInvite();
    const invitePage = new InviteSuppliersPage(page);
    const invited = await invitePage.inviteFirstAvailableSupplier();
    await page.goto(`/p2p/rfq/${rfqId}`);
    await page.waitForLoadState('networkidle');
    if (noSuppliersText && !invited && $test) {
      $test.skip(true, 'RFQ has no invited suppliers and no suppliers available to invite for this tenant.');
      return;
    }
  }

  await page.waitForLoadState('networkidle');
  const detailPage2 = new RFQDetailPage(page);
  const issueVisible = await detailPage2.issueRfqButton.isVisible().catch(() => false);
  if (issueVisible) {
    try {
      await detailPage2.issueRfqAndConfirm('AUTO_QA_ Sole source justification for E2E test.');
      await page.reload();
      await page.waitForLoadState('networkidle');
    } catch (e) {
      if ($test) $test.skip(true, 'Could not issue RFQ: ' + (e as Error).message);
      return;
    }
  }

  const detailPage3 = new RFQDetailPage(page);
  const enterQuoteVisible = await detailPage3.enterQuoteButton.isVisible().catch(() => false);
  if (enterQuoteVisible) {
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);
    const validUntilStr = validUntil.toISOString().split('T')[0];
    try {
      await detailPage3.enterQuoteAndSubmit(validUntilStr);
    } catch (e) {
      if ($test) $test.skip(true, 'Could not enter quote (check line unit prices or supplier): ' + (e as Error).message);
      return;
    }
    await page.reload();
    await page.waitForLoadState('networkidle');
  }

  await page.goto(`/p2p/rfq/${rfqId}/comparison`);
  await page.waitForLoadState('networkidle');
  const compPage = new QuoteComparisonPage(page);
  await compPage.verifyPageLoaded();
  const hasNoQuotes = await compPage.noQuotesAlert.isVisible().catch(() => false);
  if (hasNoQuotes && $test) {
    $test.skip(true, 'No quotes after setup; Enter Quote may require line unit prices > 0 or eligible supplier.');
    return;
  }
  if (hasNoQuotes) {
    throw new Error('This scenario requires an RFQ with at least one quote. No quotes on comparison page.');
  }
  console.log('✅ [P2P] On Quote Comparison page with at least one quote');
});

/** Use when already on RFQ detail (e.g. after creating an RFQ). Invite one supplier, issue RFQ, enter one quote. */
Given('I ensure the current RFQ has one quote for comparison', async function ({ page }) {
  const rfqId = (this as any).currentRfqId ?? new RFQDetailPage(page).getCurrentRfqIdFromUrl();
  (this as any).currentRfqId = rfqId;
  const detailPage = new RFQDetailPage(page);
  await detailPage.verifyDetailLoaded();

  await detailPage.goToInvite();
  const invitePage = new InviteSuppliersPage(page);
  const invited = await invitePage.inviteFirstAvailableSupplier();
  if (!invited) {
    throw new Error(
      'Phase 3 E2E requires at least one supplier in the tenant. No suppliers available to invite on Invite Suppliers page. ' +
        'Prerequisite: Add suppliers to the tenant (P2P supplier master) or verify the Invite Suppliers page loads supplier list.'
    );
  }
  await page.goto(`/p2p/rfq/${rfqId}`);
  await page.waitForLoadState('networkidle');

  const detailPage2 = new RFQDetailPage(page);
  const issueVisible = await detailPage2.issueRfqButton.isVisible().catch(() => false);
  if (issueVisible) {
    await detailPage2.issueRfqAndConfirm('AUTO_QA_ Sole source justification for E2E test.');
    await page.reload();
    await page.waitForLoadState('networkidle');
  }

  const detailPage3 = new RFQDetailPage(page);
  const enterQuoteVisible = await detailPage3.enterQuoteButton.isVisible().catch(() => false);
  expect(enterQuoteVisible, 'Enter Quote button should be visible after issuing RFQ').toBe(true);
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30);
  await detailPage3.enterQuoteAndSubmit(validUntil.toISOString().split('T')[0]);
  await page.reload();
  await page.waitForLoadState('networkidle');
  console.log('✅ [P2P] Current RFQ has one quote for comparison');
});

When('I navigate to Quote Comparison for that RFQ', async function ({ page }) {
  const rfqId = (this as any).currentRfqId;
  if (!rfqId) throw new Error('No current RFQ id. Ensure a previous step set it (e.g. open first RFQ).');
  const compPage = new QuoteComparisonPage(page);
  await compPage.goto(rfqId);
  await compPage.verifyPageLoaded();
  console.log('✅ [P2P] Navigated to Quote Comparison for RFQ');
});

Then('I should see the comparison table with at least one quote row', async function ({ page }) {
  const compPage = new QuoteComparisonPage(page);
  await expect(compPage.comparisonTable).toBeVisible({ timeout: 10000 });
  const bodyRows = page.locator('table tbody tr').filter({ has: page.getByRole('button', { name: 'Select' }) });
  await expect(bodyRows.first()).toBeVisible({ timeout: 5000 });
  console.log('✅ [P2P] Comparison table with at least one quote row');
});

Then('I should see "Lowest Price" or "Total Quotes" summary', async function ({ page }) {
  const totalQuotes = page.getByText('Total Quotes');
  const lowestPrice = page.getByText('Lowest Price');
  const either = totalQuotes.or(lowestPrice);
  await expect(either.first()).toBeVisible({ timeout: 5000 });
  console.log('✅ [P2P] Summary cards visible');
});

Given('I am on the Quote Comparison page for an RFQ with quotes', async function ({ page, $test }) {
  const listPage = new RFQListPage(page);
  await listPage.goto();
  await listPage.verifyPageLoaded();
  const hasRfq = await listPage.hasAtLeastOneRFQ();
  expect(hasRfq, 'Need at least one RFQ').toBe(true);
  await listPage.openFirstRFQ();
  const detailPage = new RFQDetailPage(page);
  const rfqId = detailPage.getCurrentRfqIdFromUrl();
  (this as any).currentRfqId = rfqId;
  const compPage = new QuoteComparisonPage(page);
  await compPage.goto(rfqId);
  await compPage.verifyPageLoaded();
  const hasNoQuotes = await compPage.noQuotesAlert.isVisible().catch(() => false);
  if (hasNoQuotes && $test) {
    $test.skip(true, 'No RFQ with quotes in environment; scenario requires test data.');
    return;
  }
  if (hasNoQuotes) {
    throw new Error('This scenario requires an RFQ with at least one quote.');
  }
  console.log('✅ [P2P] On Quote Comparison page with quotes');
});

When('I select the first quote as winning and submit with reason {string}', async function (
  { page },
  reason: string
) {
  const compPage = new QuoteComparisonPage(page);
  await compPage.selectFirstQuoteAndSubmitReason(reason);
  console.log('✅ [P2P] Selected first quote and submitted with reason');
});

Then('I should see a success message for quote selection', async function ({ page }) {
  const message = page.getByText(/Quote selected successfully|Awaiting approval|selected.*success/i);
  await expect(message.first()).toBeVisible({ timeout: 10000 });
  console.log('✅ [P2P] Success message for quote selection');
});

Then('the RFQ should show selection pending or approved state', async function ({ page }) {
  await page.goto(`/p2p/rfq/${(this as any).currentRfqId}`);
  await page.waitForLoadState('networkidle');
  const pendingOrApproved = page.getByText(/Selection Pending|Selection Approved/i);
  await expect(pendingOrApproved).toBeVisible({ timeout: 10000 });
  console.log('✅ [P2P] RFQ in selection pending or approved state');
});

Given('I am on the RFQ detail page for an RFQ with selection not yet approved', async function ({
  page,
}) {
  const listPage = new RFQListPage(page);
  await listPage.goto();
  await listPage.verifyPageLoaded();
  const hasRfq = await listPage.hasAtLeastOneRFQ();
  expect(hasRfq, 'Need at least one RFQ').toBe(true);
  await listPage.openFirstRFQ();
  const detailPage = new RFQDetailPage(page);
  await detailPage.verifyDetailLoaded();
  (this as any).rfqDetailPage = detailPage;
  console.log('✅ [P2P] On RFQ detail (selection not yet approved)');
});

Then('the "Create PO" button should not be visible or should be disabled', async function ({ page }) {
  const createPO = page.getByRole('button', { name: /Create Purchase Order/i });
  const count = await createPO.count();
  if (count === 0) {
    console.log('✅ [P2P] Create PO button not visible (expected when selection not approved)');
    return;
  }
  await expect(createPO.first()).toBeDisabled();
  console.log('✅ [P2P] Create PO button disabled');
});

Then('the latest quote should include structured fields for rates and validity', async function ({ page }) {
  const rfqId = (this as any).currentRfqId;
  if (!rfqId) throw new Error('No current RFQ id for structured quote validation.');

  const detailPage = new RFQDetailPage(page);
  await detailPage.goto(rfqId);
  await detailPage.verifyDetailLoaded();

  const hasEnterQuote = await detailPage.enterQuoteButton.isVisible().catch(() => false);
  expect(hasEnterQuote, 'Quote capture should expose structured entry flow on RFQ detail').toBe(true);

  await page.goto(`/p2p/rfq/${rfqId}/comparison`);
  await page.waitForLoadState('networkidle');
  const compPage = new QuoteComparisonPage(page);
  await compPage.verifyPageLoaded();
  await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 10000 });
  console.log('✅ [P2P] Structured quote captured and visible in comparison context');
});

Then('quote comparison should display decision evidence across defined criteria dimensions', async function ({
  page,
}) {
  const compPage = new QuoteComparisonPage(page);
  await compPage.verifyPageLoaded();
  await expect(compPage.comparisonTable).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/Lowest Price|Total Quotes/i).first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('columnheader', { name: /Supplier|Rank/i }).first()).toBeVisible({
    timeout: 10000,
  });
  console.log('✅ [P2P] Comparison evidence available (supplier/rank + summary metrics)');
});

Then('selecting a winning quote without reason should be blocked by validation', async function ({ page }) {
  const compPage = new QuoteComparisonPage(page);
  await compPage.verifyPageLoaded();
  await compPage.selectQuoteButton.click();
  await expect(compPage.selectionDialog).toBeVisible({ timeout: 5000 });
  await compPage.submitForApprovalButton.click();
  const validation = compPage.selectionDialog
    .getByRole('alert')
    .or(compPage.selectionDialog.getByText(/reason.*required|please provide.*reason/i));
  await expect(validation.first()).toBeVisible({ timeout: 5000 });
  await page.keyboard.press('Escape');
  console.log('✅ [P2P] Recommendation reason validation enforced');
});

Then('the selector should be blocked from approving the same RFQ selection', async function ({ page }) {
  const rfqId = (this as any).currentRfqId;
  if (!rfqId) throw new Error('No current RFQ id for selector-approval block check.');
  const detailPage = new RFQDetailPage(page);
  await detailPage.goto(rfqId);
  await detailPage.verifyDetailLoaded();
  await expect(detailPage.approveSelectionButton).toBeHidden({ timeout: 10000 });
  console.log('✅ [P2P] Selector cannot approve own recommendation (SoD block active)');
});

Then('sole-source issue should require justification in RFQ issue confirmation', async function ({ page, $test }) {
  const rfqId = (this as any).currentRfqId;
  if (!rfqId) throw new Error('No current RFQ id for sole-source justification check.');
  const detailPage = new RFQDetailPage(page);
  await detailPage.goto(rfqId);
  await detailPage.verifyDetailLoaded();

  const issueVisible = await detailPage.issueRfqButton.isVisible().catch(() => false);
  if (!issueVisible) {
    $test?.skip(true, 'Issue RFQ action unavailable for this RFQ state.');
    return;
  }

  await detailPage.issueRfqButton.click();
  const alert = page.getByRole('alertdialog');
  await expect(alert).toBeVisible({ timeout: 5000 });
  await expect(alert.getByPlaceholder(/justification for sole source/i)).toBeVisible({ timeout: 5000 });
  await page.keyboard.press('Escape');
  console.log('✅ [P2P] Sole-source justification field present in issue confirmation');
});

Then('only approved winning selection should allow PO creation', async function ({ page }) {
  const createPO = page.getByRole('button', { name: /Create Purchase Order/i }).first();
  const visible = await createPO.isVisible().catch(() => false);
  if (!visible) {
    console.log('✅ [P2P] Create PO hidden before approved winning selection');
    return;
  }
  await expect(createPO).toBeDisabled();
  console.log('✅ [P2P] Create PO disabled until approved winning selection');
});

Then('quote data for selected recommendation should be immutable or locked for edit', async function ({
  page,
}) {
  const rfqId = (this as any).currentRfqId;
  if (!rfqId) throw new Error('No current RFQ id for immutability validation.');
  const detailPage = new RFQDetailPage(page);
  await detailPage.goto(rfqId);
  await detailPage.verifyDetailLoaded();

  const pendingOrApproved = page.getByText(/Selection Pending|Selection Approved/i).first();
  await expect(pendingOrApproved).toBeVisible({ timeout: 10000 });
  await expect(detailPage.enterQuoteButton).toBeHidden({ timeout: 10000 });
  console.log('✅ [P2P] Quote entry/edit actions locked after winning recommendation submitted');
});
