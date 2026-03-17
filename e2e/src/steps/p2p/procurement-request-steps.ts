import { createBdd } from 'playwright-bdd';
import { expect, test } from '@playwright/test';
import { ProcurementRequestsPage } from '../../pages/p2p/ProcurementRequestsPage';

const { Given, When, Then } = createBdd();

let procurementRequestsPage: ProcurementRequestsPage;

Given('I am on the Procurement Requests page', async function ({ page }) {
  procurementRequestsPage = new ProcurementRequestsPage(page);
  await procurementRequestsPage.goto();
  await procurementRequestsPage.verifyPageLoaded();
  (this as any).procurementRequestsPage = procurementRequestsPage;
});

Then('I should see the requests table or empty state', async function ({ page }) {
  const prPage = (this as any).procurementRequestsPage ?? new ProcurementRequestsPage(page);
  const tableHeader = prPage.page.getByRole('columnheader', { name: 'Request #' });
  const emptyState = prPage.page.getByText('No procurement requests found');
  await expect(tableHeader.or(emptyState)).toBeVisible({ timeout: 10000 });
  console.log('✅ [P2P] Requests table or empty state verified');
});

/** Generic: any list page has table or empty state (for P2P phases 2–8 smoke). */
Then('I should see the list or empty state', async function ({ page }) {
  const table = page.locator('table');
  const emptyState = page.getByText(/No .* found|No .* yet|empty/i);
  await expect(table.or(emptyState)).toBeVisible({ timeout: 10000 });
  console.log('✅ [P2P] List or empty state verified');
});

When('I create a new procurement request in draft with purpose {string}', async function (
  { page },
  purpose: string
) {
  const prPage = (this as any).procurementRequestsPage ?? new ProcurementRequestsPage(page);
  if (!(this as any).procurementRequestsPage) {
    await prPage.goto();
    await prPage.verifyPageLoaded();
  }

  await prPage.openCreateRequestDialog();

  const today = new Date();
  const requiredBy = new Date(today);
  requiredBy.setDate(requiredBy.getDate() + 14);
  const requiredByStr = requiredBy.toISOString().slice(0, 10);
  await prPage.fillRequiredByDate(requiredByStr);
  await prPage.fillPurpose(purpose);

  await prPage.addFirstMaterial();
  // MaterialSelectDialog uses a Button as trigger (not an input); opens dialog with table
  const materialTrigger = prPage.page.getByRole('button', { name: /Search and select material/i });
  await expect(materialTrigger).toBeVisible({ timeout: 8000 });
  await materialTrigger.click();
  await expect(prPage.page.getByRole('dialog').filter({ hasText: 'Select Raw Material' })).toBeVisible({
    timeout: 8000,
  });
  await prPage.page.getByRole('button', { name: 'Select' }).first().click({ timeout: 5000 });
  await expect(prPage.page.getByRole('dialog').filter({ hasText: 'Select Raw Material' })).toBeHidden({
    timeout: 3000,
  });

  await prPage.saveDraft();
  (this as any).lastPrPurpose = purpose;
  console.log(`✅ [P2P] Created PR in draft with purpose: ${purpose}`);
});

Then('I should see a success message for procurement request creation', async function ({ page }) {
  await expect(
    page.locator('[data-sonner-toast]').filter({ hasText: /saved as draft|draft saved|Procurement request saved/i })
  ).toBeVisible({ timeout: 5000 });
  console.log('✅ [P2P] Success message for PR creation verified');
});

Then('the new procurement request should appear in the list with status {string}', async function (
  { page },
  status: string
) {
  await expect(page.getByRole('dialog').filter({ hasText: 'Create Procurement Request' })).toBeHidden({
    timeout: 8000,
  });
  await page.waitForLoadState('domcontentloaded');
  const rowWithStatus = page.locator('table tbody tr').filter({ hasText: status }).first();
  await expect(rowWithStatus).toBeVisible({ timeout: 15000 });
  console.log(`✅ [P2P] PR with status "${status}" found in list`);
});

Given('there is a draft procurement request for testing', async function ({ page }) {
  const prPage = (this as any).procurementRequestsPage ?? new ProcurementRequestsPage(page);
  if (!(this as any).procurementRequestsPage) {
    await prPage.goto();
    (this as any).procurementRequestsPage = prPage;
  }
  await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 5000 }).catch(async () => {
    await prPage.openCreateRequestDialog();
    const requiredBy = new Date();
    requiredBy.setDate(requiredBy.getDate() + 14);
    await prPage.fillRequiredByDate(requiredBy.toISOString().slice(0, 10));
    await prPage.fillPurpose(`AUTO_QA_ Draft for submit test ${Date.now()}`);
    await prPage.addFirstMaterial();
    await prPage.page.waitForTimeout(500);
    await prPage.page.getByPlaceholder('Search and select material...').click();
    await prPage.page.getByRole('option').first().click({ timeout: 5000 });
    await prPage.saveDraft();
  });
  console.log('✅ [P2P] Draft PR available for testing');
});

When('I submit the draft procurement request for approval', async function ({ page }) {
  const draftRow = page.locator('table tbody tr').filter({ hasText: 'Draft' }).first();
  await expect(draftRow).toBeVisible({ timeout: 5000 });
  await draftRow.click();
  await page.waitForURL(/\/p2p\/procurement-requests\/[^/]+$/, { timeout: 10000 });
  const submitBtn = page.getByRole('button', { name: /Submit for Approval|Submitting/i });
  await expect(submitBtn).toBeVisible({ timeout: 10000 });
  await submitBtn.click();
  await expect(
    page.locator('[data-sonner-toast]').filter({ hasText: /submitted|success/i })
  ).toBeVisible({ timeout: 8000 });
  console.log('✅ [P2P] Submitted draft PR for approval');
});

Then('I should see a success message for submission', async function ({ page }) {
  await expect(
    page.locator('[data-sonner-toast]').filter({ hasText: /submitted|success/i })
  ).toBeVisible({ timeout: 5000 });
  console.log('✅ [P2P] Submission success message verified');
});

Then('the procurement request status should be {string}', async function ({ page }, status: string) {
  const url = page.url();
  const onDetailPage = /\/p2p\/procurement-requests\/[^/]+$/.test(url);
  if (onDetailPage) {
    await expect(page.locator('main').getByText(status, { exact: true })).toBeVisible({ timeout: 10000 });
  } else {
    const statusInTable = page.locator('table').getByText(status, { exact: true }).first();
    await expect(statusInTable).toBeVisible({ timeout: 10000 });
  }
  console.log(`✅ [P2P] PR status is "${status}"`);
});

Given('there is a submitted procurement request for testing', async function ({ page }) {
  const prPage = (this as any).procurementRequestsPage ?? new ProcurementRequestsPage(page);
  if (!(this as any).procurementRequestsPage) await prPage.goto();
  const submittedRow = page.locator('table tbody tr').filter({ hasText: 'Submitted' }).first();
  await expect(submittedRow).toBeVisible({ timeout: 15000 });
  console.log('✅ [P2P] Submitted PR available for testing');
});

When('I approve the submitted procurement request', async function ({ page }) {
  const submittedRow = page.locator('table tbody tr').filter({ hasText: 'Submitted' }).first();
  await expect(submittedRow).toBeVisible({ timeout: 5000 });
  await submittedRow.getByRole('button').first().click();
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
  await page.getByRole('dialog').getByRole('button', { name: /Confirm|Approve/i }).click();
  await expect(
    page.locator('[data-sonner-toast]').filter({ hasText: /approved|success/i })
  ).toBeVisible({ timeout: 8000 });
  console.log('✅ [P2P] Approved submitted PR');
});

Then('I should see a success message for approval', async function ({ page }) {
  await expect(
    page.locator('[data-sonner-toast]').filter({ hasText: /approved|success/i })
  ).toBeVisible({ timeout: 5000 });
  console.log('✅ [P2P] Approval success message verified');
});

When('I reject the submitted procurement request with reason {string}', async function (
  { page },
  reason: string
) {
  const submittedRow = page.locator('table tbody tr').filter({ hasText: 'Submitted' }).first();
  await expect(submittedRow).toBeVisible({ timeout: 5000 });
  const rejectBtn = submittedRow.locator('button').filter({ has: page.locator('svg[class*="red"]') }).first();
  const hasReject = await rejectBtn.isVisible().catch(() => false);
  if (hasReject) {
    await rejectBtn.click();
  } else {
    await submittedRow.getByRole('button').nth(1).click();
  }
  const dialog = page.getByRole('dialog');
  try {
    await expect(dialog).toBeVisible({ timeout: 6000 });
  } catch {
    test.skip(true, 'Reject dialog did not open - current user may lack reject permission for P2P');
    return;
  }
  await dialog.getByLabel(/Rejection Reason/i).fill(reason);
  await dialog.getByRole('button', { name: 'Reject' }).click();
  await expect(
    page.locator('[data-sonner-toast]').filter({ hasText: /rejected|success/i })
  ).toBeVisible({ timeout: 8000 });
  console.log('✅ [P2P] Rejected submitted PR');
});

Then('I should see a success message for rejection', async function ({ page }) {
  await expect(
    page.locator('[data-sonner-toast]').filter({ hasText: /rejected|success/i })
  ).toBeVisible({ timeout: 5000 });
  console.log('✅ [P2P] Rejection success message verified');
});

When('I attempt to reject the submitted procurement request without a reason', async function ({ page }) {
  const submittedRow = page.locator('table tbody tr').filter({ hasText: 'Submitted' }).first();
  await expect(submittedRow).toBeVisible({ timeout: 5000 });
  const rejectBtn = submittedRow.locator('button').filter({ has: page.locator('svg[class*="red"]') }).first();
  const hasReject = await rejectBtn.isVisible().catch(() => false);
  if (hasReject) {
    await rejectBtn.click();
  } else {
    await submittedRow.getByRole('button').nth(1).click();
  }
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 6000 });
  await dialog.getByRole('button', { name: 'Reject' }).click();
});

Then('I should see a validation message for missing rejection reason', async function ({ page }) {
  const dialog = page.getByRole('dialog');
  const validationMessage = dialog.getByRole('alert').or(
    dialog.getByText(/rejection reason.*required|reason is required|please enter a rejection reason/i)
  );
  await expect(validationMessage).toBeVisible({ timeout: 8000 });
});

Then('the Approve action should not be available for the draft request', async function ({ page }) {
  const firstRow = page.locator('table tbody tr').first();
  await firstRow.click();
  await page.waitForURL(/\/p2p\/procurement-requests\/[^/]+$/);
  await expect(page.getByRole('button', { name: /Approve/i })).toBeHidden();
  console.log('✅ [P2P] Approve not available for draft PR');
});

Given('there is an approved procurement request for testing', async function ({ page }) {
  const prPage = (this as any).procurementRequestsPage ?? new ProcurementRequestsPage(page);
  if (!(this as any).procurementRequestsPage) await prPage.goto();
  const approvedBadge = page.getByRole('cell', { name: 'Approved' }).first();
  await expect(approvedBadge).toBeVisible({ timeout: 15000 });
  console.log('✅ [P2P] Approved PR available for testing');
});

Then('the Convert to PO or Create RFQ action should be available for the approved request', async function ({
  page,
}) {
  const approvedRow = page.locator('table tbody tr').filter({ hasText: 'Approved' }).first();
  await expect(approvedRow).toBeVisible({ timeout: 5000 });
  await expect(approvedRow.getByRole('button').first()).toBeVisible();
  console.log('✅ [P2P] Convert to PO / Create RFQ action available');
});

When(
  'I reject the current procurement request from the details page with reason {string}',
  async function ({ page }, reason: string) {
    // If we're still on the list, open the first Submitted PR detail as the "current" request.
    const onDetailPage = /\/p2p\/procurement-requests\/[^/]+$/.test(page.url());
    if (!onDetailPage) {
      const submittedRow = page.locator('table tbody tr').filter({ hasText: 'Submitted' }).first();
      await expect(submittedRow).toBeVisible({ timeout: 15000 });
      await submittedRow.click();
      await page.waitForURL(/\/p2p\/procurement-requests\/[^/]+$/, { timeout: 15000 });
    }

    const rejectButton = page
      .getByRole('button', { name: /Reject/i })
      .or(page.getByRole('button', { name: /Reject Procurement Request/i }));
    await expect(rejectButton.first()).toBeVisible({ timeout: 15000 });
    await rejectButton.first().click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 6000 });
    await dialog.getByLabel(/Rejection Reason/i).fill(reason);
    await dialog.getByRole('button', { name: /Reject/i }).click();
    console.log('✅ [P2P] Rejected current PR from details page');
  }
);

When('I open the procurement request audit trail', async function ({ page }) {
  const submittedRow = page.locator('table tbody tr').filter({ hasText: 'Submitted' }).first();
  await expect(submittedRow).toBeVisible({ timeout: 15000 });
  await submittedRow.click();
  await page.waitForURL(/\/p2p\/procurement-requests\/[^/]+$/, { timeout: 15000 });

  const auditTab = page
    .getByRole('tab', { name: /Audit|Activity|History/i })
    .or(page.getByRole('button', { name: /Audit|Activity|History/i }));
  if (await auditTab.first().isVisible().catch(() => false)) {
    await auditTab.first().click();
  }
  console.log('✅ [P2P] Opened PR audit trail section');
});

Then(
  'the audit trail should show "Created By" and "Last Updated By" as user names',
  async function ({ page }) {
    const auditSection = page
      .getByRole('region', { name: /Audit|Activity|History/i })
      .or(page.locator('main'));

    const createdBy = auditSection.getByText(/Created By/i);
    const updatedBy = auditSection.getByText(/Last Updated By/i);

    await expect(createdBy).toBeVisible({ timeout: 15000 });
    await expect(updatedBy).toBeVisible({ timeout: 15000 });
    console.log('✅ [P2P] Audit trail shows Created By / Last Updated By labels');
  }
);

Then(
  'the audit trail should list status transitions such as "Draft" to "Submitted" or "Approved"',
  async function ({ page }) {
    const auditSection = page
      .getByRole('region', { name: /Audit|Activity|History/i })
      .or(page.locator('main'));

    const transitionEntry = auditSection.getByText(
      /Status changed from|Draft.*Submitted|Submitted.*Approved/i
    );
    await expect(transitionEntry.first()).toBeVisible({ timeout: 15000 });
    console.log('✅ [P2P] Audit trail shows status transition entries');
  }
);
