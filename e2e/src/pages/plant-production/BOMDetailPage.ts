import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * BOM Detail Page Object Model
 *
 * Source: web_app/src/app/plant-production/bom/[id]/page.tsx
 *
 * Purpose: Covers BOM detail view, status transitions (detail page buttons),
 *          component line items table, and delete from detail page.
 */
export class BOMDetailPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async verifyPageLoaded(bomName: string): Promise<void> {
    await expect(this.page.getByRole('heading', { level: 1 })).toContainText(bomName, { timeout: 10000 });
    console.log(`✅ [BOM-DETAIL] Detail page loaded for: ${bomName}`);
  }

  async getBOMStatus(): Promise<string> {
    const badge = this.page.locator('.inline-flex').filter({ hasText: /DRAFT|UNDER REVIEW|APPROVED|ACTIVE|INACTIVE|OBSOLETE/i }).first();
    return (await badge.textContent() || '').trim();
  }

  async getComponentLineCount(): Promise<number> {
    // Wait for the loading spinner to disappear (the detail page fetches data async)
    const spinner = this.page.locator('.animate-spin');
    if (await spinner.isVisible()) {
      await spinner.waitFor({ state: 'hidden', timeout: 15000 });
    }

    // Wait for the component lines card to be visible
    await this.page.getByText('Component Line Items').waitFor({ state: 'visible', timeout: 10000 });
    // Brief wait for table rows to render after heading appears
    await this.page.waitForTimeout(500);

    // Check if the empty-state is shown instead of the table
    const emptyMsg = this.page.getByText('No component lines found for this BOM');
    if (await emptyMsg.isVisible()) {
      console.log('⚠️ [BOM-DETAIL] Empty state shown — no component lines');
      return 0;
    }

    // The hasNot filter already excludes the "Total Estimated Cost" row,
    // so count is the exact number of component lines
    const rows = this.page.locator('table tbody tr').filter({ hasNot: this.page.getByText('Total Estimated Cost') });
    const count = await rows.count();
    console.log(`[BOM-DETAIL] Raw row count (excl. total row): ${count}`);
    return count;
  }

  async verifyComponentInLines(componentName: string): Promise<void> {
    await expect(this.page.getByRole('cell', { name: componentName })).toBeVisible({ timeout: 5000 });
    console.log(`✅ [BOM-DETAIL] Component visible in lines: ${componentName}`);
  }

  async verifyCriticalComponentBadge(componentName: string): Promise<void> {
    const row = this.page.locator('table tbody tr').filter({ has: this.page.getByText(componentName) });
    await expect(row.getByText('Critical')).toBeVisible({ timeout: 5000 });
    console.log(`✅ [BOM-DETAIL] Critical badge visible for: ${componentName}`);
  }

  async verifyBOMNumber(): Promise<string> {
    // The BOM number appears in a paragraph: "BOM #: BOM-XXXX • Version: ..."
    // Use getByText to find the specific element containing "BOM #:"
    const para = this.page.locator('p').filter({ hasText: /BOM #:/ }).first();
    await para.waitFor({ state: 'visible', timeout: 10000 });
    const text = await para.textContent() || '';
    const match = text.match(/BOM #:\s*(BOM-\d+)/);
    const bomNumber = match ? match[1] : '';
    console.log(`✅ [BOM-DETAIL] BOM Number: ${bomNumber} (from: "${text.substring(0, 50)}")`);
    return bomNumber;
  }

  // ─── Status Management (from detail page) ────────────────────────────────

  async clickSubmitForReview(): Promise<void> {
    await this.page.getByRole('button', { name: 'Submit for Review' }).click();
    console.log('✅ [BOM-DETAIL] Clicked Submit for Review');
  }

  async clickApprove(): Promise<void> {
    await this.page.getByRole('button', { name: 'Approve' }).click();
    console.log('✅ [BOM-DETAIL] Clicked Approve');
  }

  async clickActivate(): Promise<void> {
    await this.page.getByRole('button', { name: 'Activate BOM' }).click();
    console.log('✅ [BOM-DETAIL] Clicked Activate BOM');
  }

  async clickDeactivate(): Promise<void> {
    await this.page.getByRole('button', { name: 'Deactivate' }).click();
    console.log('✅ [BOM-DETAIL] Clicked Deactivate');
  }

  async clickSendBackToDraft(): Promise<void> {
    await this.page.getByRole('button', { name: 'Send Back to Draft' }).click();
    console.log('✅ [BOM-DETAIL] Clicked Send Back to Draft');
  }

  async clickMarkObsolete(): Promise<void> {
    await this.page.getByRole('button', { name: 'Mark as Obsolete' }).click();
    console.log('✅ [BOM-DETAIL] Clicked Mark as Obsolete');
  }

  async waitForStatusToast(expectedStatus?: string): Promise<void> {
    const pattern = expectedStatus
      ? new RegExp(`BOM status updated to ${expectedStatus}|status updated`, 'i')
      : /BOM status updated|status updated/i;
    // Use .filter() to avoid strict mode violation with multiple toasts
    await this.page.locator('[data-sonner-toast]').filter({ hasText: pattern }).first()
      .waitFor({ state: 'visible', timeout: 15000 });
    console.log(`✅ [BOM-DETAIL] Status updated toast visible`);
  }

  async verifyStatusBadge(expectedStatus: string): Promise<void> {
    // Status badge is a styled badge within the BOM # paragraph
    // e.g. "BOM #: BOM-0013 • Version: 1.0 • Draft"
    const para = this.page.locator('p').filter({ hasText: /BOM #:/ }).first();
    await expect(para).toContainText(expectedStatus, { timeout: 5000 });
    console.log(`✅ [BOM-DETAIL] Status badge shows: ${expectedStatus}`);
  }

  async verifyObsoleteMessage(): Promise<void> {
    await expect(this.page.getByText('This BOM is obsolete. No further actions available.')).toBeVisible({ timeout: 5000 });
    console.log('✅ [BOM-DETAIL] Obsolete message visible');
  }

  // ─── Delete from detail page ───────────────────────────────────────────────

  async deleteBOMFromDetail(): Promise<void> {
    await this.page.getByRole('button', { name: 'Delete' }).click();
    await expect(this.page.getByRole('dialog')).toBeVisible({ timeout: 3000 });
    await this.page.getByRole('button', { name: /^Delete$/ }).click();
    console.log('✅ [BOM-DETAIL] Deleted BOM from detail page');
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  async goBack(): Promise<void> {
    await this.page.getByRole('button', { name: 'Back' }).click();
    await this.page.waitForLoadState('networkidle');
    console.log('✅ [BOM-DETAIL] Navigated back to BOM list');
  }
}
