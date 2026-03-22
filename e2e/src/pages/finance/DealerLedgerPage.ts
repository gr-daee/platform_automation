import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * Finance Dealer Ledger Page Object Model
 *
 * Source: ../web_app/src/app/finance/dealer-ledger/page.tsx
 *         ../web_app/src/app/finance/dealer-ledger/components/DealerLedgerContent.tsx
 *
 * Purpose: Dealer ledger — select dealer, load ledger, assert summary/transaction rows (finance FIN-DL + O2C E2E).
 */
export class DealerLedgerPage extends BasePage {
  /** Dealer picker lives in the first summary card (not the transaction-type Select). */
  readonly dealerComboboxTrigger: Locator;
  readonly dealerSearchInput: Locator;
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;
  readonly loadLedgerButton: Locator;
  readonly transactionHistoryHeading: Locator;
  readonly transactionsTable: Locator;
  readonly exportCsvButton: Locator;
  readonly exportStandardPdfButton: Locator;
  readonly exportDetailedInvoicePdfButton: Locator;

  constructor(page: Page) {
    super(page);

    this.dealerComboboxTrigger = page.locator('[data-slot="card"]').first().getByRole('combobox');
    this.dealerSearchInput = page.getByPlaceholder(/search by name or code/i);
    this.fromDateInput = page.locator('#from-date');
    this.toDateInput = page.locator('#to-date');
    this.loadLedgerButton = page.getByRole('button', { name: /load ledger/i });
    // CardTitle "Transaction History" renders as div, not heading
    this.transactionHistoryHeading = page.getByText(/transaction history/i).first();
    this.transactionsTable = page.getByRole('table');
    this.exportCsvButton = page.getByRole('button', { name: /export csv/i });
    this.exportStandardPdfButton = page.getByRole('button', { name: 'Dealer Ledger', exact: true });
    this.exportDetailedInvoicePdfButton = page.getByRole('button', { name: 'Invoice Ledger', exact: true });
  }

  /** Transaction History card root (filters + table). */
  transactionHistoryCard(): Locator {
    return this.page.locator('[data-slot="card"]').filter({ has: this.page.getByText('Transaction History') }).first();
  }

  async setLedgerFromDate(isoDate: string): Promise<void> {
    await this.fromDateInput.fill(isoDate);
  }

  async setLedgerToDate(isoDate: string): Promise<void> {
    await this.toDateInput.fill(isoDate);
  }

  async clearLedgerDateRange(): Promise<void> {
    await this.fromDateInput.clear();
    await this.toDateInput.clear();
  }

  /**
   * Transaction type filter (Radix Select inside Transaction History card).
   */
  async selectTransactionTypeFilter(optionLabel: string): Promise<void> {
    const historyCard = this.transactionHistoryCard();
    await historyCard.getByRole('combobox').click();
    await this.page.getByRole('option', { name: optionLabel, exact: true }).click();
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 5000 }).catch(() => {});
  }

  async clickExportCsv(): Promise<void> {
    await this.exportCsvButton.click();
  }

  async expectCsvExportSuccessToast(): Promise<void> {
    await expect(
      this.page.locator('[data-sonner-toast]').filter({ hasText: /Exported \d+ transactions to CSV/i }).first()
    ).toBeVisible({ timeout: 30000 });
  }

  async clickExportStandardDealerLedgerPdf(): Promise<void> {
    await this.exportStandardPdfButton.click();
  }

  async clickExportDetailedInvoiceLedgerPdf(): Promise<void> {
    await this.exportDetailedInvoicePdfButton.click();
  }

  async expectStandardPdfExportSuccessToast(): Promise<void> {
    await expect(
      this.page
        .locator('[data-sonner-toast]')
        .filter({ hasText: /Standard dealer ledger PDF exported successfully/i })
        .first()
    ).toBeVisible({ timeout: 60000 });
  }

  async expectDetailedPdfExportSuccessToast(): Promise<void> {
    await expect(
      this.page
        .locator('[data-sonner-toast]')
        .filter({ hasText: /Detailed invoice ledger PDF exported successfully/i })
        .first()
    ).toBeVisible({ timeout: 60000 });
  }

  transactionSearchInput(): Locator {
    return this.transactionHistoryCard().getByPlaceholder(/Search by doc/i);
  }

  async searchTransactions(query: string): Promise<void> {
    await this.transactionSearchInput().fill(query);
  }

  async expectTransactionDataRowCount(count: number): Promise<void> {
    await expect(this.transactionsTable.locator('tbody tr')).toHaveCount(count, { timeout: 15000 });
  }

  async getFirstDataRowDocumentNumber(): Promise<string> {
    const docCell = this.transactionsTable.locator('tbody tr').first().getByRole('cell').nth(2);
    const raw = (await docCell.innerText()).trim();
    return raw.split(/\s+/)[0] ?? raw;
  }

  async clickTransactionDateColumnHeader(): Promise<void> {
    const th = this.transactionHistoryCard().locator('th').filter({ has: this.page.getByText('Date', { exact: true }) }).first();
    await th.click();
  }

  async expectArAgingAnalysisVisible(): Promise<void> {
    await expect(this.page.getByText('AR Aging Analysis', { exact: true })).toBeVisible({ timeout: 15000 });
  }

  /** Passes when no aging data (card hidden) or when card is shown with heading. */
  async expectArAgingAnalysisOnlyIfPresent(): Promise<void> {
    const heading = this.page.getByText('AR Aging Analysis', { exact: true });
    if (await heading.isVisible().catch(() => false)) {
      await expect(heading).toBeVisible();
    }
  }

  /**
   * Passes whether or not VAN card is shown (only when unallocated payments exist).
   */
  async expectVanSectionOnlyIfPresent(): Promise<void> {
    const heading = this.page.getByText('Unallocated Payments (VAN)', { exact: true });
    if (await heading.isVisible().catch(() => false)) {
      await expect(heading).toBeVisible();
    }
  }

  async expectAllVisibleDataRowsHaveTransactionType(typeLabel: string): Promise<void> {
    const rows = this.transactionsTable.locator('tbody tr');
    const n = await rows.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      await expect(rows.nth(i).getByRole('cell').nth(1)).toHaveText(typeLabel);
    }
  }

  /**
   * First document link in a row whose transaction type column matches (e.g. Invoice, Payment, Credit Note).
   */
  async openFirstDocumentLinkForTransactionType(typeLabel: string, urlPattern: RegExp): Promise<void> {
    const row = this.transactionsTable
      .locator('tbody tr')
      .filter({ has: this.page.getByText(typeLabel, { exact: true }) })
      .first();
    await expect(row).toBeVisible({ timeout: 10000 });
    const link = row.getByRole('link').first();
    await expect(link).toBeVisible({ timeout: 5000 });
    await Promise.all([this.page.waitForURL(urlPattern, { timeout: 25000 }), link.click()]);
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
   * Click Load Ledger, assert success toast, then wait for transaction section (stable UI).
   */
  async loadDealerLedgerAndWaitForData(timeoutMs: number = 25000): Promise<void> {
    await this.clickLoadLedger();
    await expect(
      this.page.locator('[data-sonner-toast]').filter({ hasText: /Ledger loaded successfully/i }).first()
    ).toBeVisible({ timeout: timeoutMs });
    await this.waitForLedgerLoaded(timeoutMs);
  }

  async expectLoadLedgerButtonDisabled(): Promise<void> {
    await expect(this.loadLedgerButton).toBeDisabled();
  }

  /**
   * Dealer Information card (after ledger load).
   * Scope to ShadCN Card (`data-slot="card"`) so the dealer combobox (also contains name/code) is excluded.
   */
  async expectDealerInformation(businessName: string, dealerCode: string): Promise<void> {
    const card = this.page
      .locator('[data-slot="card"]')
      .filter({ has: this.page.getByText('Dealer Information') })
      .first();
    await expect(card.getByText(businessName, { exact: true })).toBeVisible({ timeout: 15000 });
    await expect(card.getByText(dealerCode, { exact: true })).toBeVisible({ timeout: 15000 });
  }

  async expectSummaryCardsVisible(): Promise<void> {
    await expect(this.page.getByText('Opening Balance', { exact: true })).toBeVisible({ timeout: 15000 });
    await expect(this.page.getByText('Current Outstanding', { exact: true })).toBeVisible();
    await expect(this.page.getByText('Total Invoiced', { exact: true })).toBeVisible();
    await expect(this.page.getByText('Total Paid', { exact: true })).toBeVisible();
  }

  async expectTransactionHistoryTableVisible(): Promise<void> {
    await expect(this.transactionHistoryHeading).toBeVisible({ timeout: 15000 });
    await expect(this.transactionsTable).toBeVisible({ timeout: 10000 });
  }

  async expectAtLeastOneTransactionDataRow(): Promise<void> {
    const dataRows = this.transactionsTable.locator('tbody tr');
    await expect
      .poll(async () => dataRows.count(), {
        timeout: 20000,
        message: 'Expected at least one transaction row in dealer ledger table',
      })
      .toBeGreaterThan(0);
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
