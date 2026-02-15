import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';
import { DialogComponent } from '../../support/components/DialogComponent';
import { PollingHelper } from '../../support/helpers/PollingHelper';

/**
 * O2C Indents Page Object Model
 *
 * Source: ../web_app/src/app/o2c/components/O2CIndentsManager.tsx
 *         ../web_app/src/app/o2c/components/O2CIndentsTable.tsx
 *         ../web_app/src/app/o2c/components/DealerSelectionDialog.tsx
 *
 * Purpose: Manages indent list, table row actions, filters, and dealer selection modal.
 */
export class IndentsPage extends BasePage {
  private dialogComponent: DialogComponent;

  // List page header and actions
  readonly pageHeading: Locator;
  readonly pageDescription: Locator;
  readonly createIndentButton: Locator;
  readonly exportCsvButton: Locator;
  readonly searchInput: Locator;
  readonly clearFiltersButton: Locator;

  // Status cards (one of the card titles for presence check)
  readonly statusCardsRegion: Locator;

  // Table and empty/error state
  readonly indentsTable: Locator;
  readonly emptyStateHeading: Locator;
  readonly emptyStateSubtext: Locator;
  readonly errorStateHeading: Locator;
  readonly tryAgainButton: Locator;

  // Pagination (when visible)
  readonly paginationPreviousButton: Locator;
  readonly paginationNextButton: Locator;

  // Dealer selection modal locators
  readonly dealerModal: Locator;
  readonly dealerSearchInput: Locator;
  readonly dealerTableRows: Locator;
  readonly dealerSelectButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.dialogComponent = new DialogComponent(page);

    // List page elements (semantic: heading, button names, placeholder)
    this.pageHeading = page.getByRole('heading', { name: /O2C Indents/i });
    this.pageDescription = page.getByText(/Manage dealer indents for fertilizers/i);
    this.createIndentButton = page.getByRole('button', { name: /create indent/i });
    this.exportCsvButton = page.getByRole('button', { name: /export csv/i });
    this.searchInput = page.getByPlaceholder(/Search indents by dealer name, indent number/i);
    // Scope to main: toolbar "Clear filters" only (avoid popover "Clear filters" inside Status filter)
    this.clearFiltersButton = page.getByRole('main').getByRole('button', { name: /clear filters/i });

    // Status cards: CardTitle may render as div, not heading; use text
    this.statusCardsRegion = page.getByText(/Total Indents/i).first();

    // Table and states
    this.indentsTable = page.getByRole('table');
    this.emptyStateHeading = page.getByRole('heading', { name: /No indents found/i });
    this.emptyStateSubtext = page.getByText(/Create your first indent to start the order-to-cash workflow/i);
    this.errorStateHeading = page.getByText(/Error loading indents/i);
    this.tryAgainButton = page.getByRole('button', { name: /try again/i });

    // Pagination
    this.paginationPreviousButton = page.getByRole('button', { name: /previous/i });
    this.paginationNextButton = page.getByRole('button', { name: /next/i });

    // Dealer selection modal (within dialog)
    this.dealerModal = page.getByRole('dialog');
    this.dealerSearchInput = this.dealerModal.getByPlaceholder(/search by dealer code, name, gst, or territory/i);
    this.dealerTableRows = this.dealerModal.getByRole('row');
    this.dealerSelectButtons = this.dealerModal.getByRole('button', { name: /select/i });
  }
  
  /**
   * Navigate to O2C Indents page
   */
  async navigate(): Promise<void> {
    await this.navigateTo('/o2c/indents');
  }
  
  /**
   * Click Create Indent button and wait for modal
   */
  async clickCreateIndent(): Promise<void> {
    await this.createIndentButton.click();
    await this.dialogComponent.waitForOpen();
  }
  
  /**
   * Verify dealer selection modal is visible
   */
  async verifyDealerModalVisible(): Promise<void> {
    await expect(this.dealerModal).toBeVisible();
    await expect(this.dealerModal.getByRole('heading', { name: /select dealer/i })).toBeVisible();
  }
  
  /**
   * Get count of dealers displayed in modal
   */
  async getDealerCount(): Promise<number> {
    await expect(this.dealerModal.getByRole('table')).toBeVisible();
    const rows = await this.dealerTableRows.all();
    // Subtract 1 for header row
    return Math.max(0, rows.length - 1);
  }
  
  /**
   * Search for dealer in modal
   */
  async searchDealer(searchTerm: string): Promise<void> {
    await this.dealerSearchInput.fill(searchTerm);
    // Wait for search to trigger (debounce delay)
    await this.page.waitForTimeout(500);
  }
  
  /**
   * Verify dealer appears in filtered results
   * Uses polling to wait for results to load (max 15 seconds)
   */
  async verifyDealerInResults(dealerName: string): Promise<void> {
    // Poll until dealer results are loaded and visible
    const dealerRows = this.dealerModal.getByRole('row', { name: new RegExp(dealerName, 'i') });
    
    await PollingHelper.pollUntil(
      async () => {
        const count = await dealerRows.count();
        return count > 0;
      },
      {
        timeout: 15000, // Max 15 seconds as requested
        interval: 500,  // Poll every 500ms
        description: `dealer "${dealerName}" to appear in search results`,
        onPoll: (attempt, elapsed) => {
          console.log(`⏳ Polling for dealer results (attempt ${attempt}, ${elapsed}ms elapsed)...`);
        },
      }
    );
    
    // Verify at least one matching dealer is found
    const count = await dealerRows.count();
    expect(count).toBeGreaterThan(0);
    
    // Verify first matching dealer is visible
    await expect(dealerRows.first()).toBeVisible();
    
    console.log(`✅ Found ${count} dealer(s) matching "${dealerName}"`);
  }
  
  /**
   * Verify dealer modal shows no matching dealers (empty search result).
   * Waits for "No dealers found matching your search." or dealer count 0.
   */
  async verifyDealerModalShowingNoResults(): Promise<void> {
    const noResultsText = this.dealerModal.getByText(/no dealers found matching your search/i);
    await expect(noResultsText).toBeVisible({ timeout: 10000 });
    const count = await this.getDealerCount();
    expect(count).toBe(0);
  }

  /**
   * Select dealer from modal by name
   * If multiple dealers match, selects the first one
   */
  async selectDealer(dealerName: string): Promise<void> {
    // Handle multiple matching dealers by selecting the first match
    const dealerRows = this.dealerModal.getByRole('row', { name: new RegExp(dealerName, 'i') });
    const firstMatchingRow = dealerRows.first();
    
    // Find Select button in the first matching row
    const selectButton = firstMatchingRow.getByRole('button', { name: /select/i });
    await selectButton.click();
    
    console.log(`✅ Selected dealer: "${dealerName}" (first match)`);
      
      // Wait for modal to close
      await this.dialogComponent.waitForClose();
    }
  
  /**
   * Verify user is on indent creation/details page with dealer pre-selected
   */
  async verifyIndentCreationPage(dealerName?: string): Promise<void> {
    // URL should be /o2c/indents/:id or /o2c/indents/create
    await expect(this.page).toHaveURL(/\/o2c\/indents\/(create|[a-f0-9-]+)/);

    // If dealer name provided, verify it's displayed
    if (dealerName) {
      const dealerDisplay = this.page.getByText(dealerName);
      await expect(dealerDisplay).toBeVisible();
    }
  }

  // -------------------------------------------------------------------------
  // List page verification and table row actions (for TC-001 and workflows)
  // -------------------------------------------------------------------------

  /**
   * Verify the O2C Indents list page has loaded: heading, Create Indent button,
   * and either status cards + table or empty state.
   */
  async verifyListPageLoaded(): Promise<void> {
    await expect(this.pageHeading).toBeVisible();
    await expect(this.createIndentButton).toBeVisible();
    // Status cards (Total Indents text) or table/empty state; allow time for load
    const statusOrTable =
      this.statusCardsRegion.or(this.indentsTable).or(this.emptyStateHeading);
    await expect(statusOrTable.first()).toBeVisible({ timeout: 15000 });
    // Table or empty state should be present
    await expect(this.indentsTable.or(this.emptyStateHeading).first()).toBeVisible({ timeout: 10000 });
  }

  /**
   * Get the table row that contains the given indent number (or dealer name).
   * Scoped to the main page table (excludes dealer modal).
   */
  getRowByIndentNumber(indentNumberOrDealer: string): Locator {
    return this.indentsTable.getByRole('row').filter({ hasText: new RegExp(indentNumberOrDealer, 'i') });
  }

  /**
   * Open the row actions dropdown (kebab) for the row containing the given indent/dealer.
   * The trigger is the only button in that row.
   */
  async openRowActionsMenu(indentNumberOrDealer: string): Promise<void> {
    const row = this.getRowByIndentNumber(indentNumberOrDealer);
    await row.getByRole('button').click();
    // Wait for menu to be visible (menuitems appear)
    await expect(this.page.getByRole('menu')).toBeVisible({ timeout: 5000 });
  }

  /**
   * Click a row action by its menu item name (e.g. "View Details", "Submit for Approval", "Approve", "Reject", "Delete").
   */
  async clickRowAction(menuItemName: string | RegExp): Promise<void> {
    const name = typeof menuItemName === 'string' ? menuItemName : menuItemName;
    await this.page.getByRole('menuitem', { name }).click();
  }

  /**
   * Confirm delete in the AlertDialog (title "Delete Indent").
   */
  async confirmDeleteInAlertDialog(): Promise<void> {
    const alert = this.page.getByRole('alertdialog');
    await expect(alert).toBeVisible({ timeout: 5000 });
    await alert.getByRole('button', { name: /^Delete$/i }).click();
  }

  /**
   * Cancel delete in the AlertDialog.
   */
  async cancelDeleteInAlertDialog(): Promise<void> {
    const alert = this.page.getByRole('alertdialog');
    await expect(alert).toBeVisible({ timeout: 5000 });
    await alert.getByRole('button', { name: /cancel/i }).click();
  }

  /**
   * Click the indent row (e.g. indent number or dealer cell) to navigate to detail page.
   */
  async clickIndentRow(indentNumberOrDealer: string): Promise<void> {
    const row = this.getRowByIndentNumber(indentNumberOrDealer);
    await row.first().click();
  }

  /**
   * Click the first data row in the table (navigates to that indent's detail page).
   * Row index 0 is header, so first data row is nth(1).
   */
  async clickFirstIndentRow(): Promise<void> {
    await this.indentsTable.getByRole('row').nth(1).click();
  }

  /**
   * Check if the Clear filters button is visible (active filters present).
   */
  async hasClearFiltersButton(): Promise<boolean> {
    return this.clearFiltersButton.isVisible().catch(() => false);
  }

  // -------------------------------------------------------------------------
  // List search and filters (TC-004, TC-005, TC-006, TC-023)
  // -------------------------------------------------------------------------

  /**
   * Type in the indents search input (debounced in app; wait for table update after).
   */
  async fillSearch(term: string): Promise<void> {
    await this.searchInput.fill(term);
    // Brief wait for debounce; table update is asserted in steps
    await this.page.waitForTimeout(400);
  }

  /**
   * Open the Status faceted filter and select an option by label (e.g. "Draft", "Approved").
   * Uses Popover + Command: button "Status" opens listbox with options.
   */
  async selectStatusFilter(optionLabel: string): Promise<void> {
    // Button may show "Status" or "Status 1 selected" when filter active
    await this.page.getByRole('button', { name: /Status/i }).first().click();
    // Wait for the specific option (single locator to avoid strict mode violation)
    const option = this.page.getByRole('option', { name: new RegExp(optionLabel, 'i') });
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();
    // Popover may close; wait for filter to apply (table or empty state updates)
    await this.page.waitForTimeout(300);
  }

  /**
   * Click the main "Clear filters" button (visible when any filter is active).
   */
  async clearAllFilters(): Promise<void> {
    await this.clearFiltersButton.click();
  }

  /**
   * Get count of data rows in the indents table (excluding header).
   */
  async getTableDataRowCount(): Promise<number> {
    const rows = await this.indentsTable.getByRole('row').count();
    return Math.max(0, rows - 1);
  }

  /**
   * Check if the empty state ("No indents found") is visible.
   */
  async isEmptyStateVisible(): Promise<boolean> {
    return this.emptyStateHeading.isVisible().catch(() => false);
  }
}
