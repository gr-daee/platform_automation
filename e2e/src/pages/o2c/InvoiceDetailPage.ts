import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * O2C Invoice Detail Page Object Model
 *
 * Source: ../web_app/src/app/o2c/invoices/[id]/page.tsx
 *         ../web_app/src/app/o2c/invoices/[id]/components/InvoiceDetailsContent.tsx
 *
 * Purpose: Invoice detail – Generate Custom eInvoice PDF, download trigger.
 */
export class InvoiceDetailPage extends BasePage {
  readonly generateCustomEInvoicePdfButton: Locator;
  readonly pageHeading: Locator;

  constructor(page: Page) {
    super(page);

    // CardTitle "E-Invoice Information" renders as div, not heading; use getByText
    this.pageHeading = page.getByText(/e-invoice information/i).first();
    // Either button (for verifyPageLoaded): "Generate custom..." or "Download Custom..." when PDF ready
    this.generateCustomEInvoicePdfButton = page.getByRole('button', {
      name: /generate custom e-?invoice pdf|download custom .*invoice pdf/i,
    });
  }

  async goto(invoiceId: string): Promise<void> {
    await this.navigateTo(`/o2c/invoices/${invoiceId}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyPageLoaded(): Promise<void> {
    // Wait for loading indicator to disappear first (page may show "Loading invoice details...")
    const loadingIndicators = [
      this.page.getByText(/Loading.*invoice/i),
      this.page.getByText(/Loading\.\.\./i),
      this.page.locator('[role="status"]').filter({ hasText: /Loading/i }),
    ];
    
    // Wait for all loading indicators to disappear (up to 30s)
    for (const indicator of loadingIndicators) {
      try {
        await expect(indicator).toBeHidden({ timeout: 30000 }).catch(() => {});
      } catch {
        // Indicator might not exist, continue
      }
    }
    
    // Wait for network to stabilize
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    await this.page.waitForTimeout(1000);
    
    // Verify page loaded: E-Invoice Information section is visible (button may or may not be present)
    // Note: The Custom E-Invoice PDF button is only present when e-invoice is generated,
    // so we don't require it for page load verification
    await expect(this.pageHeading).toBeVisible({ timeout: 10000 });
  }

  async isGenerateCustomEInvoicePdfVisible(): Promise<boolean> {
    return this.generateCustomEInvoicePdfButton.isVisible().catch(() => false);
  }

  /** Locator for "Download Custom..." (shown when PDF is already generated). */
  get downloadCustomInvoicePdfButton(): Locator {
    return this.page.getByRole('button', { name: /download custom .*invoice pdf/i });
  }

  /** Locator for "Generate custom..." (shown when PDF is not yet generated). */
  get generateCustomEInvoicePdfButtonOnly(): Locator {
    return this.page.getByRole('button', { name: /generate custom .*e-?invoice pdf/i });
  }

  async isDownloadCustomInvoicePdfVisible(): Promise<boolean> {
    return this.downloadCustomInvoicePdfButton.isVisible().catch(() => false);
  }

  /**
   * Click "Generate custom..." (triggers backend generation; UI then shows "Download Custom..." when ready).
   */
  async clickGenerateCustomEInvoicePdf(): Promise<void> {
    await this.pageHeading.scrollIntoViewIfNeeded().catch(() => {});
    await this.page.waitForTimeout(300);
    const btn = this.generateCustomEInvoicePdfButtonOnly;
    await btn.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(200);
    await btn.click();
  }

  /**
   * Click "Download Custom..." (triggers download; use when PDF is already generated).
   */
  async clickDownloadCustomInvoicePdf(): Promise<void> {
    await this.pageHeading.scrollIntoViewIfNeeded().catch(() => {});
    await this.page.waitForTimeout(300);
    const btn = this.downloadCustomInvoicePdfButton;
    await btn.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(200);
    await btn.click();
  }

  /**
   * Wait for "Download Custom..." button to appear (e.g. after "Generate custom..." finished).
   */
  async waitForDownloadCustomInvoicePdfButton(timeoutMs: number = 60000): Promise<void> {
    await expect(this.downloadCustomInvoicePdfButton).toBeVisible({ timeout: timeoutMs });
  }
}
