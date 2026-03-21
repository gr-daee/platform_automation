import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { RFQListPage } from '../../pages/p2p/RFQListPage';
import { CreateRFQPage } from '../../pages/p2p/CreateRFQPage';
import { ProcurementRequestsPage } from '../../pages/p2p/ProcurementRequestsPage';

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
