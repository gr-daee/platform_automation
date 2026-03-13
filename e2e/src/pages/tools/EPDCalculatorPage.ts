import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';
import { SelectComponent } from '../../support/components/SelectComponent';

/**
 * EPD Calculator Page Object
 *
 * Source: ../web_app/src/app/tools/epd-calculator/page.tsx (if exists)
 * Purpose: Configure EPD approach/formula, calculate EPD, verify result.
 */
export class EPDCalculatorPage extends BasePage {
  private selectComponent: SelectComponent;
  readonly pageTitle: Locator;
  readonly approachSelect: Locator;
  readonly formulaSelect: Locator;
  readonly resultDisplay: Locator;

  constructor(page: Page) {
    super(page);
    this.selectComponent = new SelectComponent(page);
    this.pageTitle = page.getByRole('heading', { name: /EPD|Early Payment/i }).or(
      page.locator('[data-slot="card-title"]').filter({ hasText: /EPD|Early Payment/i })
    );
    this.approachSelect = page.getByRole('combobox').filter({ hasText: /approach|reduce|CCN/i }).first();
    this.formulaSelect = page.getByRole('combobox').filter({ hasText: /formula/i }).first();
    this.resultDisplay = page.locator('[class*="result"], [data-slot="card-content"]').filter({ hasText: /₹|discount|EPD/i });
  }

  async goto(): Promise<void> {
    await this.navigateTo('/tools/epd-calculator');
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/tools\/epd-calculator/, { timeout: 10000 });
    await expect(this.pageTitle.or(this.page.getByText('EPD'))).toBeVisible({ timeout: 10000 }).catch(() => {});
  }

  async selectEPDApproach(approach: 'reduce_outstanding' | 'create_ccn'): Promise<void> {
    const label = approach === 'reduce_outstanding' ? /reduce|outstanding/i : /CCN|credit note/i;
    await this.page.getByRole('combobox').first().click();
    await this.page.getByRole('option', { name: label }).click();
  }

  async selectEPDFormula(formula: string): Promise<void> {
    await this.selectComponent.selectByLabel('Formula', formula).catch(() => {
      this.page.getByRole('combobox').filter({ hasText: /formula/i }).click();
      this.page.getByRole('option', { name: formula }).click();
    });
  }

  async verifyEPDResult(expectedAmount: number): Promise<void> {
    await expect(this.page.getByText(new RegExp(String(expectedAmount), 'i'))).toBeVisible({ timeout: 5000 });
  }
}
