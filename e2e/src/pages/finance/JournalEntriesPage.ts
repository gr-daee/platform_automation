import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * Journal entries list and create flow.
 *
 * Source: ../web_app/src/app/finance/journal-entries/
 */
export class JournalEntriesPage extends BasePage {
  readonly listHeading: Locator;
  readonly newEntryButton: Locator;

  readonly formHeading: Locator;
  readonly entryDateInput: Locator;
  readonly descriptionTextarea: Locator;
  readonly postImmediatelyButton: Locator;
  readonly saveDraftButton: Locator;
  readonly addLineButton: Locator;

  constructor(page: Page) {
    super(page);
    this.listHeading = page.getByRole('heading', { name: 'Journal Entries' });
    this.newEntryButton = page.getByRole('button', { name: 'New Journal Entry' });

    this.formHeading = page.getByRole('heading', { name: /New Journal Entry/i });
    this.entryDateInput = page.locator('#entry-date');
    this.descriptionTextarea = page.locator('#description');
    this.postImmediatelyButton = page.getByRole('button', { name: 'Post Immediately' });
    this.saveDraftButton = page.getByRole('button', { name: 'Save as Draft' });
    this.addLineButton = page.getByRole('button', { name: 'Add Line' });
  }

  async gotoList(): Promise<void> {
    await this.navigateTo('/finance/journal-entries');
    await expect(this.listHeading).toBeVisible({ timeout: 20000 });
  }

  async gotoNew(): Promise<void> {
    await this.navigateTo('/finance/journal-entries/new');
    await expect(this.formHeading).toBeVisible({ timeout: 20000 });
  }

  /**
   * Select COA line by row index (0-based) — Radix Select per row.
   */
  lineRow(index: number): Locator {
    return this.page.locator('tbody tr').filter({ hasNotText: 'Totals' }).nth(index);
  }

  async selectAccountForLine(rowIndex: number, optionText: RegExp): Promise<void> {
    const row = this.lineRow(rowIndex);
    const trigger = row.locator('[role="combobox"]').first();
    await trigger.click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    await this.page.getByRole('option', { name: optionText }).first().click();
  }

  async fillLineDescription(rowIndex: number, text: string): Promise<void> {
    const row = this.lineRow(rowIndex);
    const desc = row.locator('input[placeholder="Line description"]');
    await desc.fill(text);
  }

  async fillLineDebit(rowIndex: number, amount: string): Promise<void> {
    const row = this.lineRow(rowIndex);
    const debit = row.locator('td').nth(3).locator('input[type="number"]');
    await debit.fill(amount);
  }

  async fillLineCredit(rowIndex: number, amount: string): Promise<void> {
    const row = this.lineRow(rowIndex);
    const credit = row.locator('td').nth(4).locator('input[type="number"]');
    await credit.fill(amount);
  }

  async clickPostImmediatelyAndConfirm(): Promise<void> {
    this.page.once('dialog', (d) => d.accept());
    await this.postImmediatelyButton.click();
  }

  async expectJournalNumberVisible(journalNumber: string): Promise<void> {
    await expect(this.page.getByText(journalNumber, { exact: false }).first()).toBeVisible({
      timeout: 15000,
    });
  }
}
