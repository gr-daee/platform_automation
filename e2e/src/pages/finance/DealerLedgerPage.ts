import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * Finance Dealer Ledger Page Object Model
 *
 * Source: ../web_app/src/app/finance/dealer-ledger/page.tsx
 *         ../web_app/src/app/finance/dealer-ledger/components/DealerLedgerContent.tsx
 *
 * Purpose: Dealer ledger – select dealer, load ledger, assert transaction (invoice) row.
 */
export class DealerLedgerPage extends BasePage {
  readonly dealerComboboxTrigger: Locator;
  readonly dealerSearchInput: Locator;
  readonly loadLedgerButton: Locator;
  readonly transactionHistoryHeading: Locator;
  readonly transactionsTable: Locator;

  constructor(page: Page) {
    super(page);

    this.dealerComboboxTrigger = page.getByRole('combobox').filter({
      hasText: /select dealer/i,
    }).first();
    this.dealerSearchInput = page.getByPlaceholder(/search by name or code/i);
    this.loadLedgerButton = page.getByRole('button', { name: /load ledger/i });
    // CardTitle "Transaction History" renders as div, not heading
    this.transactionHistoryHeading = page.getByText(/transaction history/i).first();
    this.transactionsTable = page.getByRole('table');
  }

  async goto(): Promise<void> {
    await this.navigateTo('/finance/dealer-ledger');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyPageLoaded(): Promise<void> {
    // Wait for loading indicator to disappear first
    const loadingIndicators = [
      this.page.getByText(/Loading.*ledger/i),
      this.page.getByText(/Loading\.\.\./i),
      this.page.locator('[role="status"]').filter({ hasText: /Loading/i }),
    ];
    
    // Wait for all loading indicators to disappear (up to 20s)
    for (const indicator of loadingIndicators) {
      try {
        await expect(indicator).toBeHidden({ timeout: 20000 }).catch(() => {});
      } catch {
        // Indicator might not exist, continue
      }
    }
    
    // Wait for network to stabilize
    await this.page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
    await this.page.waitForTimeout(500);
    
    // Now verify page elements are visible
    await expect(this.dealerComboboxTrigger).toBeVisible({ timeout: 10000 });
  }

  /**
   * Open dealer combobox, search by dealer code or name, select matching option.
   * Prefer role="option"; fallback to visible text matching dealer code/name.
   */
  async selectDealerByCodeOrName(searchText: string): Promise<void> {
    await this.dealerComboboxTrigger.click();
    await this.dealerSearchInput.fill(searchText);
    await this.page.waitForTimeout(800);
    const option = this.page.getByRole('option').filter({ hasText: new RegExp(searchText, 'i') }).first();
    const fallback = this.page.getByText(new RegExp(searchText.replace(/\s+/g, '\\s*'), 'i')).first();
    if (await option.isVisible().catch(() => false)) {
      await option.click();
    } else {
      await fallback.click();
    }
  }

  async clickLoadLedger(): Promise<void> {
    await this.loadLedgerButton.click();
  }

  /**
   * Wait for ledger to load (Transaction History card and table visible).
   * Handles loading indicators after clicking "Load Ledger" button.
   */
  async waitForLedgerLoaded(timeoutMs: number = 15000): Promise<void> {
    // Wait for loading indicators to disappear (ledger data loading)
    const loadingIndicators = [
      this.page.getByText(/Loading.*ledger/i),
      this.page.getByText(/Loading.*transaction/i),
      this.page.getByText(/Loading\.\.\./i),
      this.page.locator('[role="status"]').filter({ hasText: /Loading/i }),
    ];
    
    // Wait for all loading indicators to disappear (up to timeoutMs)
    for (const indicator of loadingIndicators) {
      try {
        await expect(indicator).toBeHidden({ timeout: timeoutMs }).catch(() => {});
      } catch {
        // Indicator might not exist, continue
      }
    }
    
    // Wait for network to stabilize
    await this.page.waitForLoadState('networkidle', { timeout: timeoutMs }).catch(() => {});
    await this.page.waitForTimeout(500);

    // Scroll to transaction section (may be below dealer summary cards)
    await this.transactionHistoryHeading.scrollIntoViewIfNeeded().catch(() => {});
    await this.page.waitForTimeout(300);

    // Verify ledger elements: "Transaction History" text (CardTitle) and table
    await expect(this.transactionHistoryHeading).toBeVisible({ timeout: timeoutMs });
    await expect(this.transactionsTable).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert at least one transaction row with type "Invoice" (and optionally reference number).
   */
  async hasInvoiceTransaction(invoiceNumber?: string): Promise<boolean> {
    const table = this.transactionsTable;
    await expect(table).toBeVisible({ timeout: 5000 });
    const rowWithInvoice = this.page.getByRole('row').filter({
      has: this.page.getByText('Invoice'),
    });
    const count = await rowWithInvoice.count();
    if (count === 0) return false;
    if (invoiceNumber) {
      const rowWithNumber = rowWithInvoice.filter({
        has: this.page.getByText(invoiceNumber),
      });
      return (await rowWithNumber.count()) > 0;
    }
    return true;
  }
}
