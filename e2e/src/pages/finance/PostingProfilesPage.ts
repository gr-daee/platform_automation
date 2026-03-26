import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * Posting Profiles — dashboard, matrix manager, simulation.
 *
 * Source: ../web_app/src/app/finance/posting-profiles/
 */
export class PostingProfilesPage extends BasePage {
  readonly dashboardHeading: Locator;
  readonly matrixCard: Locator;
  readonly simulationCard: Locator;
  readonly customerGroupsCard: Locator;
  readonly itemGroupsCard: Locator;
  readonly vendorGroupsCard: Locator;
  readonly taxMatrixCard: Locator;

  readonly addRuleButton: Locator;
  readonly moduleFilter: Locator;
  readonly accountTypeFilter: Locator;
  readonly showInactiveButton: Locator;
  readonly downloadTemplateButton: Locator;
  readonly importButton: Locator;
  readonly exportButton: Locator;
  readonly refreshButton: Locator;

  readonly simulateButton: Locator;

  constructor(page: Page) {
    super(page);

    this.dashboardHeading = page.getByRole('heading', { name: 'Advanced Posting Profiles' });
    this.matrixCard = page.locator('a[href="/finance/posting-profiles/matrix"]').first();
    this.simulationCard = page.locator('a[href="/finance/posting-profiles/simulation"]').first();
    this.customerGroupsCard = page.locator('a[href="/finance/posting-profiles/customer-groups"]').first();
    this.itemGroupsCard = page.locator('a[href="/finance/posting-profiles/item-groups"]').first();
    this.vendorGroupsCard = page.locator('a[href="/finance/posting-profiles/vendor-groups"]').first();
    this.taxMatrixCard = page.locator('a[href="/finance/posting-profiles/tax-matrix"]').first();

    this.addRuleButton = page.getByRole('button', { name: 'Add Rule' });
    this.moduleFilter = page.getByRole('combobox', { name: 'All Modules' });
    this.accountTypeFilter = page.getByRole('combobox', { name: 'All Types' });
    this.showInactiveButton = page.getByRole('button', { name: 'Show Inactive' });
    this.downloadTemplateButton = page.getByRole('button', { name: 'Download Template' });
    this.importButton = page.getByRole('button', { name: 'Import' });
    this.exportButton = page.getByRole('button', { name: 'Export' });
    this.refreshButton = page.getByRole('button', { name: 'Refresh' });

    this.simulateButton = page.getByRole('button', { name: 'Simulate' });
  }

  async gotoDashboard(): Promise<void> {
    await this.page.goto('/finance/posting-profiles', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.dashboardHeading).toBeVisible({ timeout: 15000 });
  }

  async gotoMatrix(): Promise<void> {
    await this.page.goto('/finance/posting-profiles/matrix', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.addRuleButton).toBeVisible({ timeout: 15000 });
  }

  async gotoSimulation(): Promise<void> {
    await this.page.goto('/finance/posting-profiles/simulation', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.simulateButton).toBeVisible({ timeout: 15000 });
  }

  async clickMatrixFromDashboard(): Promise<void> {
    await this.matrixCard.click();
    await expect(this.page).toHaveURL(/\/finance\/posting-profiles\/matrix/, { timeout: 15000 });
  }

  async openAddRuleDialog(): Promise<void> {
    await this.addRuleButton.click();
    await expect(this.page.getByRole('dialog')).toBeVisible({ timeout: 10000 });
  }

  async selectMatrixModuleFilter(optionLabel: RegExp | string): Promise<void> {
    const label = typeof optionLabel === 'string' ? new RegExp(optionLabel, 'i') : optionLabel;
    await this.moduleFilter.click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    await this.page.getByRole('option', { name: label }).click();
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 3000 }).catch(() => {});
  }

  async runSimulation(moduleOption: string, accountTypeOption: string): Promise<void> {
    await this.page.locator('#module').click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    await this.page.getByRole('option', { name: new RegExp(moduleOption, 'i') }).first().click();

    await this.page.locator('#account-type').click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    const preferred = this.page.getByRole('option', { name: new RegExp(accountTypeOption, 'i') }).first();
    const arFallback = this.page.getByRole('option', { name: /Accounts Receivable|AR Control/i }).first();
    const selected = (await preferred.isVisible().catch(() => false)) ? preferred : arFallback;
    await selected.click();

    await this.simulateButton.click();
  }

  async expectSimulationShowsResolvedGL(): Promise<void> {
    await expect(
      this.page.getByText(/GL Account|Account Code|Resolved/i).first()
    ).toBeVisible({ timeout: 20000 });
  }

  async expectSimulationShowsNoProfile(): Promise<void> {
    await expect(this.page.getByText(/no profile|not found|could not resolve/i).first()).toBeVisible({
      timeout: 20000,
    });
  }
}
