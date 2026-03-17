import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';
import { SelectComponent } from '../../support/components/SelectComponent';

/**
 * Procurement Requests Page Object Model
 *
 * Source: ../web_app/src/app/p2p/procurement-requests/page.tsx
 * Component: ProcurementRequestsManagerPage.tsx
 *
 * Purpose: Listing, create draft, submit, approve/reject procurement requests (Phase 1).
 */
export class ProcurementRequestsPage extends BasePage {
  private selectComponent: SelectComponent;

  readonly heading: Locator;
  readonly createRequestButton: Locator;
  readonly table: Locator;
  readonly tableHeaderRequestNumber: Locator;
  readonly emptyStateText: Locator;

  constructor(page: Page) {
    super(page);
    this.selectComponent = new SelectComponent(page);

    this.heading = page.getByRole('heading', { name: 'Procurement Requests' });
    this.createRequestButton = page.getByRole('button', { name: /Create Request/i });
    this.table = page.locator('table');
    this.tableHeaderRequestNumber = page.getByRole('columnheader', { name: 'Request #' });
    this.emptyStateText = page.getByText('No procurement requests found');
  }

  async goto(): Promise<void> {
    await this.navigateTo('/p2p/procurement-requests');
    await this.page.waitForLoadState('networkidle');
    console.log('✅ [P2P] Navigated to Procurement Requests page');
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 15000 });
    console.log('✅ [P2P] Procurement Requests page heading visible');
    const tableOrEmpty =
      this.tableHeaderRequestNumber.or(this.emptyStateText);
    await expect(tableOrEmpty).toBeVisible({ timeout: 10000 });
    console.log('✅ [P2P] Requests table or empty state visible');
  }

  async openCreateRequestDialog(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 15000 });
    await expect(this.createRequestButton).toBeVisible({ timeout: 15000 });
    await this.createRequestButton.click();
    await expect(this.page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    console.log('✅ [P2P] Create Procurement Request dialog opened');
  }

  async fillRequiredByDate(dateStr: string): Promise<void> {
    await this.page.getByLabel(/Required By Date/i).fill(dateStr);
    console.log(`✅ [P2P] Filled Required by date: ${dateStr}`);
  }

  async fillPurpose(purpose: string): Promise<void> {
    await this.page.getByLabel(/Purpose/i).or(this.page.locator('#purpose')).fill(purpose);
    console.log(`✅ [P2P] Filled purpose: ${purpose}`);
  }

  async addFirstMaterial(): Promise<void> {
    const addFirstBtn = this.page.getByRole('button', { name: /Add Your First Material/i });
    const addMaterialBtn = this.page.getByRole('button', { name: /Add Material/i });
    if (await addFirstBtn.isVisible().catch(() => false)) {
      await addFirstBtn.click();
    } else {
      await addMaterialBtn.click();
    }
    console.log('✅ [P2P] Clicked Add Material');
  }

  async selectMaterialFromDialog(searchText: string): Promise<void> {
    const trigger = this.page.getByPlaceholder('Search and select material...');
    await trigger.click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 }).catch(() => null);
    await this.page.getByRole('option').first().click({ timeout: 5000 }).catch(async () => {
      await this.page.keyboard.type(searchText, { delay: 100 });
      await this.page.getByRole('option').first().click({ timeout: 5000 });
    });
    console.log(`✅ [P2P] Selected material (search: ${searchText})`);
  }

  async saveDraft(): Promise<void> {
    await this.page.getByRole('dialog').getByRole('button', { name: /Save Draft/i }).click();
    await expect(
      this.page.locator('[data-sonner-toast]').filter({ hasText: /saved as draft|draft saved|Procurement request saved/i })
    ).toBeVisible({ timeout: 8000 });
    console.log('✅ [P2P] Saved as draft');
  }

  async submitForApproval(): Promise<void> {
    await this.page.getByRole('dialog').getByRole('button', { name: /Submit for Approval/i }).click();
    await this.waitForToast(/submitted|submission/i);
    console.log('✅ [P2P] Submitted for approval');
  }

  async getRowByRequestNumber(requestNumber: string): Promise<Locator> {
    return this.page.locator('table tbody tr').filter({ has: this.page.getByText(requestNumber) });
  }

  async getStatusBadgeForRow(row: Locator): Promise<Locator> {
    return row.locator('[class*="badge"]').filter({ hasText: /Draft|Submitted|Approved|Rejected/i });
  }
}
