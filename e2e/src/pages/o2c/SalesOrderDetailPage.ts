import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * O2C Sales Order Detail Page Object Model
 *
 * Source: ../web_app/src/app/o2c/sales-orders/[id]/page.tsx
 *
 * Purpose: Sales order detail – dealer, amounts, GST, warehouse, source indent,
 * dealer credit, line items/allocation, Generate eInvoice, invoice link, status.
 */
export class SalesOrderDetailPage extends BasePage {
  readonly backButton: Locator;
  readonly pageHeading: Locator;
  readonly salesOrderNumber: Locator;
  readonly statusBadge: Locator;
  readonly dealerName: Locator;
  readonly totalAmount: Locator;
  readonly warehouseAssigned: Locator;
  readonly sourceIndentLink: Locator;
  readonly generateEInvoiceButton: Locator;
  readonly viewEInvoiceButton: Locator;
  readonly salesOrderInformationCard: Locator;

  constructor(page: Page) {
    super(page);

    this.backButton = page.getByRole('button', { name: /back/i });
    this.pageHeading = page.getByRole('heading', { name: /sales order/i });
    // Card structure: Card > CardHeader > CardTitle (div with data-slot='card-title'), so go up 2 levels to get Card container
    // CardTitle renders as <div>, not <h1>/<h2>, so use getByText instead of getByRole('heading')
    this.salesOrderInformationCard = page.getByText(/sales order information/i).locator('../..');
    this.salesOrderNumber = this.salesOrderInformationCard.getByText(/sales order number/i).locator('..').getByRole('paragraph').first();
    // Status badge is the first badge inside Sales Order Information card (ShadCN Badge uses data-slot="badge")
    this.statusBadge = this.salesOrderInformationCard.locator('[data-slot="badge"]').first();
    this.dealerName = this.salesOrderInformationCard.getByText(/^dealer$/i).locator('..').getByRole('paragraph').first();
    this.totalAmount = this.salesOrderInformationCard.getByText(/total amount/i).locator('..').getByRole('paragraph').first();
    this.warehouseAssigned = this.salesOrderInformationCard.getByText(/warehouse assigned/i).locator('..').getByRole('paragraph').first();
    this.sourceIndentLink = page.getByRole('link', { name: /view source indent|indent_number/i });
    this.generateEInvoiceButton = page.getByRole('button', { name: /generate e-invoice/i });
    this.viewEInvoiceButton = page.getByRole('button', { name: /view e-invoice/i });
  }

  async goto(salesOrderId: string): Promise<void> {
    await this.navigateTo(`/o2c/sales-orders/${salesOrderId}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyPageLoaded(): Promise<void> {
    // Wait for loading indicator to disappear first (page may show "Loading sales order details...")
    const loadingIndicators = [
      this.page.getByText(/Loading.*sales order/i),
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
    
    // Now verify page elements are visible
    await expect(this.pageHeading).toBeVisible({ timeout: 15000 });
    
    // Verify Sales Order Information card title is visible (confirms page loaded)
    // CardTitle renders as <div> with data-slot='card-title', not a heading element
    const infoCardTitle = this.page.getByText(/sales order information/i);
    await expect(infoCardTitle).toBeVisible({ timeout: 15000 });
    
    // Verify card container is visible (with increased timeout after loading waits)
    await expect(this.salesOrderInformationCard).toBeVisible({ timeout: 10000 });
  }

  async getDealerName(): Promise<string> {
    await expect(this.dealerName).toBeVisible({ timeout: 5000 });
    return (await this.dealerName.textContent()) || '';
  }

  async getTotalAmountText(): Promise<string> {
    await expect(this.totalAmount).toBeVisible({ timeout: 5000 });
    return (await this.totalAmount.textContent()) || '';
  }

  async getWarehouseName(): Promise<string> {
    await expect(this.warehouseAssigned).toBeVisible({ timeout: 5000 });
    return (await this.warehouseAssigned.textContent()) || '';
  }

  async getStatusText(): Promise<string> {
    await expect(this.statusBadge).toBeVisible({ timeout: 10000 });
    return (await this.statusBadge.textContent()) || '';
  }

  async clickGenerateEInvoice(): Promise<void> {
    await this.generateEInvoiceButton.click();
  }

  async isGenerateEInvoiceVisible(): Promise<boolean> {
    return this.generateEInvoiceButton.isVisible().catch(() => false);
  }

  async isViewEInvoiceVisible(): Promise<boolean> {
    return this.viewEInvoiceButton.isVisible().catch(() => false);
  }

  /**
   * Wait for invoice link to appear (e.g. link to /o2c/invoices/{id} or "View E-Invoice" button).
   * Prefers the "View E-Invoice" button, then checks for invoice links in main content (not sidebar).
   * Polls up to timeoutMs (default 45000 for eInvoice generation 10–30 s).
   */
  async waitForInvoiceLink(timeoutMs: number = 45000): Promise<void> {
    // First, try to find the "View E-Invoice" button (most specific, avoids sidebar link)
    // This is the primary indicator that e-invoice is ready
    try {
      await expect(this.viewEInvoiceButton).toBeVisible({ timeout: timeoutMs });
      return; // Button found, we're done
    } catch {
      // Button not found, try invoice link in main content (exclude sidebar)
    }
    
    // Fallback: Check for invoice links in the main content area (exclude sidebar)
    // Use locator that targets links with invoice ID pattern, excluding sidebar
    const invoiceLink = this.page.locator('a[href*="/o2c/invoices/"]')
      .filter({ hasNot: this.page.locator('[data-sidebar]') })
      .first();
    
    await expect(invoiceLink).toBeVisible({ timeout: timeoutMs });
  }

  /**
   * Get first invoice detail page URL from SO page (link in Invoices card to /o2c/invoices/{id}).
   */
  async getInvoiceLinkHref(): Promise<string | null> {
    const link = this.page.locator('a[href*="/o2c/invoices/"]').first();
    if (await link.isVisible().catch(() => false)) {
      return await link.getAttribute('href');
    }
    return null;
  }

  /**
   * Click View E-Invoice to navigate to invoice detail page.
   */
  async clickViewEInvoice(): Promise<void> {
    await this.viewEInvoiceButton.click();
  }

  async hasSourceIndentLink(): Promise<boolean> {
    return this.sourceIndentLink.isVisible().catch(() => false);
  }
}
