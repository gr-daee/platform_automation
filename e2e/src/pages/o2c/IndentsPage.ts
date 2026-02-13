import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';
import { DialogComponent } from '../../support/components/DialogComponent';
import { PollingHelper } from '../../support/helpers/PollingHelper';

/**
 * O2C Indents Page Object Model
 * 
 * Source: ../web_app/src/app/o2c/components/O2CIndentsManager.tsx
 *         ../web_app/src/app/o2c/components/DealerSelectionDialog.tsx
 * 
 * Purpose: Manages indent list and dealer selection modal interactions
 */
export class IndentsPage extends BasePage {
  private dialogComponent: DialogComponent;
  
  // Main page locators
  readonly createIndentButton: Locator;
  readonly indentsTable: Locator;
  
  // Dealer selection modal locators
  readonly dealerModal: Locator;
  readonly dealerSearchInput: Locator;
  readonly dealerTableRows: Locator;
  readonly dealerSelectButtons: Locator;
  
  constructor(page: Page) {
    super(page);
    this.dialogComponent = new DialogComponent(page);
    
    // Main page elements
    this.createIndentButton = page.getByRole('button', { name: /create indent/i });
    this.indentsTable = page.getByRole('table');
    
    // Modal elements (within dialog role)
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
}
