import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * O2C Sales Returns — list shell at `/o2c/sales-returns`.
 *
 * Source: ../web_app/src/app/o2c/sales-returns/page.tsx
 *         ../web_app/src/app/o2c/sales-returns/components/SalesReturnsListClient.tsx
 *         ../web_app/src/app/o2c/sales-returns/components/SalesReturnsTable.tsx
 */
export class SalesReturnsListPage extends BasePage {
  static readonly LIST_PATH = '/o2c/sales-returns';

  readonly pageHeading: Locator;
  readonly pageDescription: Locator;
  /** Header CTA: Next.js `Link` wraps `Button` — target the link for reliable navigation. */
  readonly createReturnOrderLink: Locator;
  /** List client search (`getReturnOrders` uses `return_order_number` ilike only — not invoice). */
  readonly listSearchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole('heading', { name: /^sales returns$/i });
    this.pageDescription = page.getByText(/manage product returns and credit memos/i);
    // Header CTA is `<Link><Button/></Link>` — use the link role (first match = header before empty-state CTA).
    this.createReturnOrderLink = page.getByRole('link', { name: /create return order/i }).first();
    this.listSearchInput = page.getByPlaceholder(/search by return order number or invoice number/i);
  }

  async goto(): Promise<void> {
    await this.navigateTo(SalesReturnsListPage.LIST_PATH);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyHeadingAndDescription(): Promise<void> {
    await expect(this.pageHeading).toBeVisible({ timeout: 30000 });
    await expect(this.pageDescription).toBeVisible();
  }

  /**
   * Statistics cards from server `getReturnOrderStatistics` (Suspense).
   * If `stats` is null (API/tenant failure), the block renders nothing — Phase 1 treats that as graceful empty per FEATURE-SR-phased-plan.
   */
  async expectStatisticsCardsVisible(): Promise<void> {
    const totalReturns = this.page.getByText('Total Returns', { exact: true });
    try {
      await expect(totalReturns).toBeVisible({ timeout: 60_000 });
    } catch {
      return;
    }
    const rest = [/pending/i, /completed/i, /total value/i];
    for (const title of rest) {
      await expect(this.page.getByText(title).first()).toBeVisible({ timeout: 15_000 });
    }
  }

  /**
   * List loaded successfully: no error card; then either data table region or empty state.
   */
  async expectTableOrEmptyStateWithoutError(): Promise<void> {
    await expect(this.page.getByText(/error loading return orders/i)).not.toBeVisible();
    const tableCardTitle = this.page.getByText('Return Orders', { exact: true });
    const emptyHeading = this.page.getByRole('heading', { name: /no return orders found/i });
    await expect(tableCardTitle.or(emptyHeading)).toBeVisible({ timeout: 60000 });
  }

  async clickCreateReturnOrder(): Promise<void> {
    await this.createReturnOrderLink.click();
  }

  /** Breadcrumb: Order to Cash (link) + current Sales Returns (`breadcrumb-page`). */
  async expectBreadcrumbShowsO2CAndSalesReturns(): Promise<void> {
    const crumbNav = this.page.getByRole('navigation', { name: /breadcrumb/i });
    await expect(crumbNav.getByRole('link', { name: /order to cash/i })).toBeVisible();
    await expect(crumbNav.locator('[data-slot="breadcrumb-page"]').filter({ hasText: /^sales returns$/i })).toBeVisible();
  }

  /** Toolbar "Clear filters" (not the popover inner clear). */
  private toolbarClearFiltersButton(): Locator {
    return this.page
      .locator('div.flex.items-center.gap-2.flex-wrap')
      .filter({ has: this.page.getByRole('button', { name: /Status/ }) })
      .getByRole('button', { name: /^Clear filters$/i });
  }

  /**
   * After filter/search fetch: summary line or empty state, no error card.
   */
  async waitForListSummaryOrEmpty(timeoutMs = 60_000): Promise<void> {
    await expect(this.page.getByText(/error loading return orders/i)).not.toBeVisible();
    const summary = this.page.getByText(/\d+ return order\(s\) found/);
    const empty = this.page.getByRole('heading', { name: /no return orders found/i });
    await expect(summary.or(empty)).toBeVisible({ timeout: timeoutMs });
    // FacetedFilter popover can stay open and confuse row/cell resolution for assertions.
    await this.page.keyboard.press('Escape');
  }

  async expectEmptyListStateVisible(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: /no return orders found/i })).toBeVisible({
      timeout: 30_000,
    });
  }

  async openStatusFacetedFilter(): Promise<void> {
    await this.page.getByRole('button', { name: /Status/ }).first().click();
    await expect(this.page.getByPlaceholder('Search status...')).toBeVisible();
  }

  async openReturnReasonFacetedFilter(): Promise<void> {
    await this.page.getByRole('button', { name: /Return Reason/ }).click();
    await expect(this.page.getByPlaceholder('Search reasons...')).toBeVisible();
  }

  async selectFacetedOptionByLabel(optionLabel: string): Promise<void> {
    await this.page.getByRole('option', { name: optionLabel, exact: true }).click();
  }

  async applyStatusFilterOption(optionLabel: string): Promise<void> {
    await this.openStatusFacetedFilter();
    await this.selectFacetedOptionByLabel(optionLabel);
    await this.waitForListSummaryOrEmpty();
  }

  async applyReturnReasonFilterOption(optionLabel: string): Promise<void> {
    await this.openReturnReasonFacetedFilter();
    await this.selectFacetedOptionByLabel(optionLabel);
    await this.waitForListSummaryOrEmpty();
  }

  /**
   * Status filter trigger shows the selected status label (badge) after apply.
   */
  async expectStatusFilterShowsSelection(label: string): Promise<void> {
    await expect(this.page.getByRole('button', { name: /Status/ }).first()).toContainText(label, {
      timeout: 15_000,
    });
  }

  async expectStatusFilterDoesNotShowLabel(label: string): Promise<void> {
    await expect(this.page.getByRole('button', { name: /Status/ }).first()).not.toContainText(label);
  }

  async expectReturnReasonFilterShowsSelection(label: string): Promise<void> {
    await expect(this.page.getByRole('button', { name: /Return Reason/ })).toContainText(label, {
      timeout: 15_000,
    });
  }

  /** Return Orders grid only (exclude any other tables on the page). */
  private returnOrdersTable(): Locator {
    return this.page
      .getByRole('table')
      .filter({ has: this.page.getByRole('columnheader', { name: /Return Order/i }) });
  }

  /**
   * Each data row's Status column shows the given label (e.g. Pending).
   * Reason column index 4, Status index 6 (0-based) in Return Orders table.
   */
  /**
   * Status is the column immediately before Actions (last `td`). Rows must expose at least two cells.
   */
  async expectAllTableRowsHaveStatusLabel(statusLabel: string): Promise<void> {
    const table = this.returnOrdersTable();
    await expect(table).toBeVisible({ timeout: 15_000 });
    const rows = table.locator('tbody tr:has(td)');
    const rc = await rows.count();
    let checked = 0;
    for (let i = 0; i < rc; i++) {
      const tds = rows.nth(i).locator('td');
      const tn = await tds.count();
      if (tn < 2) continue;
      await expect(tds.nth(tn - 2)).toContainText(statusLabel);
      checked++;
    }
    expect(checked).toBeGreaterThan(0);
  }

  /** Reason is the 5th data column (0-based index 4) when the row has enough cells. */
  async expectAllTableRowsHaveReasonLabel(reasonLabel: string): Promise<void> {
    const table = this.returnOrdersTable();
    await expect(table).toBeVisible({ timeout: 15_000 });
    const rows = table.locator('tbody tr:has(td)');
    const rc = await rows.count();
    let checked = 0;
    for (let i = 0; i < rc; i++) {
      const tds = rows.nth(i).locator('td');
      const tn = await tds.count();
      if (tn < 5) continue;
      await expect(tds.nth(4)).toContainText(reasonLabel);
      checked++;
    }
    expect(checked).toBeGreaterThan(0);
  }

  async fillListSearch(value: string): Promise<void> {
    await this.listSearchInput.fill(value);
    await this.waitForListSummaryOrEmpty();
  }

  async clearListSearch(): Promise<void> {
    await this.listSearchInput.clear();
    await this.waitForListSummaryOrEmpty();
  }

  async clickToolbarClearFilters(): Promise<void> {
    await this.toolbarClearFiltersButton().click();
    await this.waitForListSummaryOrEmpty();
  }

  async expectToolbarClearFiltersHidden(): Promise<void> {
    await expect(this.toolbarClearFiltersButton()).toHaveCount(0);
  }

  async expectListSearchEmpty(): Promise<void> {
    await expect(this.listSearchInput).toHaveValue('');
  }

  /** Total count from "Showing a to b of N return orders"; null if pagination UI not shown. */
  async getPaginationTotalCount(): Promise<number | null> {
    const line = this.page.getByText(/Showing \d+ to \d+ of \d+ return orders/);
    if ((await line.count()) === 0) return null;
    const text = await line.first().textContent();
    const m = text?.match(/of (\d+) return orders/);
    if (!m) return null;
    return parseInt(m[1], 10);
  }

  /** First "Showing" number on pagination footer (1-based row start). */
  async getPaginationShowingFrom(): Promise<number | null> {
    const line = this.page.getByText(/Showing \d+ to \d+ of \d+ return orders/);
    if ((await line.count()) === 0) return null;
    const text = await line.first().textContent();
    const m = text?.match(/Showing (\d+) to/);
    if (!m) return null;
    return parseInt(m[1], 10);
  }

  async clickPaginationPageNumber(pageNum: number): Promise<void> {
    const pagRow = this.page.getByRole('button', { name: 'Previous', exact: true }).locator('..');
    await pagRow.getByRole('button', { name: String(pageNum), exact: true }).click();
    await this.waitForListSummaryOrEmpty();
    const pageSize = 20; // keep in sync with SalesReturnsListClient PAGE_SIZE
    const minFrom = (pageNum - 1) * pageSize + 1;
    await expect
      .poll(async () => (await this.getPaginationShowingFrom()) ?? 0, { timeout: 60_000 })
      .toBeGreaterThanOrEqual(minFrom);
  }

  async expectLinkToReturnOrderNumberVisible(returnOrderNumber: string): Promise<void> {
    await expect(
      this.page.getByRole('link', { name: returnOrderNumber, exact: true }).first()
    ).toBeVisible({ timeout: 15_000 });
  }

  /** True when the main Return Orders table (with header) is in the DOM (not empty-state card). */
  async hasReturnOrdersDataTable(): Promise<boolean> {
    return (await this.returnOrdersTable().count()) > 0;
  }
}
