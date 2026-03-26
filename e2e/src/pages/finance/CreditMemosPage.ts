import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * Credit Memos list page object.
 *
 * Source: ../web_app/src/app/finance/credit-memos/page.tsx
 */
export class CreditMemosPage extends BasePage {
  readonly pageTitle: Locator;
  readonly newCreditMemoButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole('heading', { name: /Credit Memos/i });
    this.newCreditMemoButton = page.getByRole('button', { name: /New Credit Memo/i });
  }

  async goto(): Promise<void> {
    await this.navigateTo('/finance/credit-memos');
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/finance\/credit-memos/, { timeout: 10000 });
    await expect(this.pageTitle).toBeVisible({ timeout: 10000 });
  }

  async clickNewCreditMemo(): Promise<void> {
    await expect(this.newCreditMemoButton).toBeVisible({ timeout: 10000 });
    await Promise.all([
      this.page.waitForURL(/\/finance\/credit-memos\/new/, { timeout: 15000 }),
      this.newCreditMemoButton.click(),
    ]);
  }
}
