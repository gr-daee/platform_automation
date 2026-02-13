import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';
import { SelectComponent } from '../../support/components/SelectComponent';

/**
 * GSTR-1 Review Page Object Model
 * 
 * Source: ../web_app/src/app/finance/compliance/gstr1/page.tsx
 * 
 * Purpose: Manages GSTR-1 Review page interactions for compliance reporting
 * 
 * Key Features:
 * - Seller GSTIN dropdown selection
 * - Filing Period (Month/Year) selection
 * - Empty state verification
 * - Access control verification
 */
export class GSTR1Page extends BasePage {
  private selectComponent: SelectComponent;
  
  // Page title/heading locators
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;
  
  // Filter locators
  readonly sellerGSTINDropdown: Locator;
  readonly filingPeriodDropdown: Locator;
  
  // Empty state locator
  readonly emptyStateMessage: Locator;
  
  // Error/access denied locators
  readonly errorMessage: Locator;
  readonly restrictedUserPage: Locator; // For access denied redirect
  
  constructor(page: Page) {
    super(page);
    this.selectComponent = new SelectComponent(page);
    
    // Page title - "GSTR-1 Review" (CardTitle renders as <div data-slot='card-title'>, not heading)
    this.pageTitle = page.locator('[data-slot="card-title"]').filter({ hasText: 'GSTR-1 Review' }).or(
      page.getByText('GSTR-1 Review', { exact: true })
    );
    this.pageDescription = page.getByText('Review outward supplies and export for GST filing');
    
    // Filter dropdowns - using combobox role for ShadCN Select
    this.sellerGSTINDropdown = page.getByRole('combobox').filter({ hasText: /seller gstin/i }).or(
      page.locator('label').filter({ hasText: /seller gstin/i }).locator('..').getByRole('combobox')
    );
    // Note: Label text is "Return Period", not "Filing Period"
    this.filingPeriodDropdown = page.getByRole('combobox').filter({ hasText: /return period/i }).or(
      page.locator('label').filter({ hasText: /return period/i }).locator('..').getByRole('combobox')
    );
    
    // Empty state message - "Select filters to load"
    // Located in a span with class "text-sm text-slate-500" inside a card
    this.emptyStateMessage = page.locator('span').filter({ hasText: 'Select filters to load' }).or(
      page.getByText('Select filters to load', { exact: false })
    );
    
    // Error message (if API fails)
    this.errorMessage = page.getByRole('alert').or(
      page.locator('.text-red-700')
    );
    
    // Restricted user page indicator (for access denied)
    this.restrictedUserPage = page.getByText(/restricted|access denied|permission/i).or(
      page.locator('h1, h2').filter({ hasText: /restricted|access/i })
    );
  }
  
  /**
   * Navigate to GSTR-1 Review page
   */
  async navigate(): Promise<void> {
    await this.navigateTo('/finance/compliance/gstr1');
    // Wait for page to stabilize after navigation
    await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    // Additional wait for React hydration
    await this.page.waitForTimeout(1000);
  }
  
  /**
   * Verify page loaded successfully
   * Checks for page title "GSTR-1 Review"
   */
  async verifyPageLoaded(): Promise<void> {
    // Wait for page to load and check URL first
    await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Check if redirected (access denied)
    const currentUrl = this.page.url();
    if (currentUrl.includes('/restrictedUser') || currentUrl.includes('/login')) {
      throw new Error(`Access denied or not logged in. Current URL: ${currentUrl}`);
    }
    
    // Verify we're on the GSTR-1 page
    await expect(this.page).toHaveURL(/\/finance\/compliance\/gstr1/, { timeout: 5000 });
    
    // CardTitle renders as <div data-slot='card-title'>, not heading
    const cardTitleVisible = await this.page.locator('[data-slot="card-title"]').filter({ hasText: 'GSTR-1 Review' }).isVisible().catch(() => false);
    const textVisible = await this.page.getByText('GSTR-1 Review', { exact: true }).isVisible().catch(() => false);
    
    // Enhanced logging for debugging
    const pageContent = await this.page.content().catch(() => '');
    const hasGSTR = pageContent.includes('GSTR-1');
    const hasCardTitle = pageContent.includes('card-title');
    const pageTitle = await this.page.title().catch(() => 'N/A');
    
    console.log(`🔍 Page Load Verification:`);
    console.log(`   URL: ${currentUrl}`);
    console.log(`   Page Title (browser): ${pageTitle}`);
    console.log(`   CardTitle visible: ${cardTitleVisible}`);
    console.log(`   Text visible: ${textVisible}`);
    console.log(`   Has "GSTR-1" text: ${hasGSTR}`);
    console.log(`   Has card-title element: ${hasCardTitle}`);
    
    if (!cardTitleVisible && !textVisible) {
      throw new Error(
        `Page title "GSTR-1 Review" not found. ` +
        `URL: ${currentUrl}, ` +
        `Page Title: ${pageTitle}, ` +
        `Has "GSTR-1" text: ${hasGSTR}, ` +
        `Has card-title: ${hasCardTitle}. ` +
        `Check screenshot for page content.`
      );
    }
    
    console.log(`✅ Page title "GSTR-1 Review" found successfully`);
    
    // Verify description
    await expect(this.pageDescription).toBeVisible({ timeout: 5000 });
  }
  
  /**
   * Verify empty state is displayed
   * Empty state shows "Select filters to load" when no GSTIN/Period selected
   * Note: Empty state appears when !data && !loading
   */
  async verifyEmptyState(): Promise<void> {
    // Wait for any loading to finish first
    await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Wait for loading spinner to disappear (if present)
    const loadingSpinner = this.page.locator('text=Loading data...');
    await expect(loadingSpinner).toBeHidden({ timeout: 5000 }).catch(() => {
      // Loading spinner might not be present, that's okay
    });
    
    // Wait a bit for React to render the empty state
    await this.page.waitForTimeout(1000);
    
    // Try multiple locator strategies
    const emptyStateLocator = this.page.locator('span.text-slate-500').filter({ hasText: 'Select filters to load' }).or(
      this.page.getByText('Select filters to load', { exact: false })
    );
    
    await expect(emptyStateLocator).toBeVisible({ timeout: 10000 });
  }
  
  /**
   * Verify Seller GSTIN and Return Period filters are present on the page
   * TC-002 requirement: Verify filters exist before checking empty state
   * Note: Label text is "Return Period", not "Filing Period"
   */
  async verifyFiltersPresent(): Promise<void> {
    // Verify Seller GSTIN filter label and combobox
    const sellerGSTINLabel = this.page.locator('label').filter({ hasText: /seller gstin/i });
    await expect(sellerGSTINLabel).toBeVisible({ timeout: 5000 });
    
    // Find the combobox associated with Seller GSTIN label
    const sellerGSTINCombobox = sellerGSTINLabel.locator('..').getByRole('combobox').first();
    await expect(sellerGSTINCombobox).toBeVisible({ timeout: 5000 });
    
    // Verify Return Period filter label and combobox (label text is "Return Period")
    const returnPeriodLabel = this.page.locator('label').filter({ hasText: /return period/i });
    await expect(returnPeriodLabel).toBeVisible({ timeout: 5000 });
    
    // Find the combobox associated with Return Period label
    const returnPeriodCombobox = returnPeriodLabel.locator('..').getByRole('combobox').first();
    await expect(returnPeriodCombobox).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Verified Seller GSTIN filter is present');
    console.log('✅ Verified Return Period filter is present');
  }
  
  /**
   * Verify access is denied (redirected to restrictedUser page or 403)
   * ProtectedPageWrapper redirects to /restrictedUser if no permissions
   */
  async verifyAccessDenied(): Promise<void> {
    // Check if redirected to restrictedUser page
    const currentUrl = this.page.url();
    const isRestrictedPage = currentUrl.includes('/restrictedUser') || 
                            await this.restrictedUserPage.isVisible().catch(() => false);
    
    if (isRestrictedPage) {
      await expect(this.page).toHaveURL(/\/restrictedUser/);
      return;
    }
    
    // Alternative: Check for 403 error or access denied message
    const hasError = await this.errorMessage.isVisible().catch(() => false);
    if (hasError) {
      await expect(this.errorMessage).toContainText(/access denied|permission|403/i);
      return;
    }
    
    // If still on GSTR-1 page but no title visible, access likely denied
    const titleVisible = await this.pageTitle.isVisible().catch(() => false);
    if (!titleVisible) {
      // Page didn't load properly - likely access denied
      throw new Error('GSTR-1 page not accessible - likely permission denied');
    }
  }
  
  /**
   * Select Seller GSTIN from dropdown
   * @param gstin - GSTIN value or "All GSTINs" option
   */
  async selectSellerGSTIN(gstin: string): Promise<void> {
    // Find the label first, then get the combobox
    const label = this.page.locator('label').filter({ hasText: /seller gstin/i });
    const combobox = label.locator('..').getByRole('combobox').first();
    
    await combobox.click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    
    // Select option - handle "All GSTINs" or specific GSTIN
    if (gstin === 'All GSTINs' || gstin.includes('All')) {
      await this.page.getByRole('option').filter({ hasText: /all gstins/i }).click();
    } else {
      await this.page.getByRole('option').filter({ hasText: gstin }).click();
    }
    
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 2000 });
  }
  
  /**
   * Select Return Period (Month/Year)
   * Note: Label text is "Return Period", not "Filing Period"
   * @param monthYear - Format: "YYYY-MM" (e.g., "2025-01")
   */
  async selectFilingPeriod(monthYear: string): Promise<void> {
    const label = this.page.locator('label').filter({ hasText: /return period/i });
    const combobox = label.locator('..').getByRole('combobox').first();
    
    await combobox.click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    
    // Format: "January 2025" from "2025-01"
    const [year, month] = monthYear.split('-');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = monthNames[parseInt(month) - 1];
    const periodLabel = `${monthName} ${year}`;
    
    await this.page.getByRole('option', { name: periodLabel }).click();
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 2000 });
  }
  
  /**
   * Verify empty state is no longer visible (data loaded)
   */
  async verifyEmptyStateHidden(): Promise<void> {
    await expect(this.emptyStateMessage).toBeHidden({ timeout: 10000 });
  }
  
  /**
   * Verify Filing Period dropdown is visible and contains current/open month
   * TC-004: Assert combobox/label visible; options include recent months
   */
  async verifyFilingPeriodDropdownVisible(): Promise<void> {
    const returnPeriodLabel = this.page.locator('label').filter({ hasText: /return period/i });
    await expect(returnPeriodLabel).toBeVisible({ timeout: 5000 });
    
    const combobox = returnPeriodLabel.locator('..').getByRole('combobox').first();
    await expect(combobox).toBeVisible({ timeout: 5000 });
    
    // Open dropdown to verify options
    await combobox.click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    
    // Verify dropdown contains current month and previous month (default)
    const currentDate = new Date();
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonthLabel = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    const previousMonthLabel = `${monthNames[previousMonth.getMonth()]} ${previousMonth.getFullYear()}`;
    
    // Check if current or previous month is in options (dropdown shows last 24 months)
    const listbox = this.page.locator('[role="listbox"]');
    const hasCurrentMonth = await listbox.getByRole('option', { name: currentMonthLabel }).isVisible().catch(() => false);
    const hasPreviousMonth = await listbox.getByRole('option', { name: previousMonthLabel }).isVisible().catch(() => false);
    
    if (!hasCurrentMonth && !hasPreviousMonth) {
      // Get all option texts for debugging
      const options = await listbox.locator('[role="option"]').allTextContents();
      throw new Error(
        `Filing Period dropdown does not contain current/open month. ` +
        `Looking for: "${currentMonthLabel}" or "${previousMonthLabel}". ` +
        `Available options: ${options.slice(0, 5).join(', ')}...`
      );
    }
    
    // Close dropdown
    await this.page.keyboard.press('Escape');
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 2000 });
    
    console.log(`✅ Verified Filing Period dropdown contains current/open month`);
  }
  
  /**
   * Verify Seller GSTIN dropdown displays "GSTIN - State Name" format
   * TC-005: Regression DEF-003 (was city e.g. Kurnook, now shows state name)
   */
  async verifySellerGSTINFormat(): Promise<void> {
    const sellerGSTINLabel = this.page.locator('label').filter({ hasText: /seller gstin/i });
    const combobox = sellerGSTINLabel.locator('..').getByRole('combobox').first();
    
    await combobox.click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    
    const listbox = this.page.locator('[role="listbox"]');
    
    // Get all GSTIN options (skip "All GSTINs" if present)
    const options = listbox.locator('[role="option"]');
    const optionCount = await options.count();
    
    if (optionCount === 0) {
      throw new Error('No GSTIN options found in dropdown');
    }
    
    // Check at least one GSTIN option follows "GSTIN - State Name" format
    // Format: GSTIN (monospace) on first line, State Name on second line
    let foundValidFormat = false;
    
    for (let i = 0; i < Math.min(optionCount, 5); i++) { // Check first 5 options
      const option = options.nth(i);
      const optionText = await option.textContent();
      
      // Skip "All GSTINs" option
      if (optionText?.includes('All GSTINs')) continue;
      
      // Check if option has GSTIN format (15 chars alphanumeric) and state name
      // Options are structured as: <span>GSTIN</span><span>State Name</span>
      const gstinSpan = option.locator('span.font-mono');
      const stateSpan = option.locator('span.text-xs.text-muted-foreground');
      
      const hasGSTIN = await gstinSpan.isVisible().catch(() => false);
      const hasStateName = await stateSpan.isVisible().catch(() => false);
      
      if (hasGSTIN && hasStateName) {
        const gstinText = await gstinSpan.textContent();
        const stateText = await stateSpan.textContent();
        
        // Verify GSTIN format (15 chars alphanumeric)
        if (gstinText && /^[A-Z0-9]{15}$/.test(gstinText.trim())) {
          foundValidFormat = true;
          console.log(`✅ Verified GSTIN format: "${gstinText}" - "${stateText}"`);
          break;
        }
      }
    }
    
    // Close dropdown
    await this.page.keyboard.press('Escape');
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 2000 });
    
    if (!foundValidFormat) {
      throw new Error('Seller GSTIN dropdown does not display "GSTIN - State Name" format');
    }
  }
  
  /**
   * Verify data loads after selecting filters and empty state disappears
   * TC-006: After selecting both GSTIN and Period, summary/tabs or data area visible
   */
  async verifyDataLoadedAfterFilters(): Promise<void> {
    // Wait for loading to complete
    await this.page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Wait for loading spinner to disappear
    const loadingSpinner = this.page.locator('text=Loading data...');
    await expect(loadingSpinner).toBeHidden({ timeout: 10000 });
    
    // Verify empty state is hidden
    await expect(this.emptyStateMessage).toBeHidden({ timeout: 10000 });
    
    // Verify "Data Loaded" status appears
    const dataLoadedStatus = this.page.locator('text=Data Loaded');
    await expect(dataLoadedStatus).toBeVisible({ timeout: 10000 });
    
    // Verify summary cards or tabs are visible (data area)
    const summaryCards = this.page.locator('[data-slot="card-title"]').filter({ hasText: /Return Period|Total Liability|B2B/i });
    const hasSummaryCards = await summaryCards.first().isVisible().catch(() => false);
    
    // Alternative: Check for tabs (Summary, B2B, B2CL, etc.)
    const tabs = this.page.locator('[role="tablist"]');
    const hasTabs = await tabs.isVisible().catch(() => false);
    
    if (!hasSummaryCards && !hasTabs) {
      throw new Error('Data area not visible after selecting filters. Summary cards or tabs should appear.');
    }
    
    console.log('✅ Verified data loaded and empty state removed');
  }
  
  /**
   * Verify Return Period summary card shows human-readable format
   * TC-007: Regression DEF-004 - Shows "December 2025" not raw "122025"
   */
  async verifyReturnPeriodCardFormat(): Promise<void> {
    // Wait for data to load
    await this.page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Find Return Period card
    const returnPeriodCard = this.page.locator('[data-slot="card-title"]')
      .filter({ hasText: /return period/i })
      .locator('..')
      .locator('..'); // Go up to Card level
    
    await expect(returnPeriodCard).toBeVisible({ timeout: 10000 });
    
    // Find the period value (large text in card)
    const periodValue = returnPeriodCard.locator('.text-2xl.font-bold');
    await expect(periodValue).toBeVisible({ timeout: 5000 });
    
    const periodText = await periodValue.textContent();
    
    // Verify format: "Month Year" (e.g., "December 2025")
    // Should NOT be raw format like "122025"
    if (!periodText) {
      throw new Error('Return Period card value is empty');
    }
    
    // Check if it's raw format (6 digits) - should NOT be
    if (/^\d{6}$/.test(periodText.trim())) {
      throw new Error(
        `Return Period card shows raw format "${periodText}" instead of human-readable format. ` +
        `Expected format: "Month Year" (e.g., "December 2025")`
      );
    }
    
    // Verify it matches human-readable format: "Month Year"
    const humanReadablePattern = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/;
    if (!humanReadablePattern.test(periodText.trim())) {
      throw new Error(
        `Return Period card format is incorrect: "${periodText}". ` +
        `Expected format: "Month Year" (e.g., "December 2025")`
      );
    }
    
    console.log(`✅ Verified Return Period card shows human-readable format: "${periodText.trim()}"`);
  }
}
