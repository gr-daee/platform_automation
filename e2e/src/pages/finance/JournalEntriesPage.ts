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
    const openedDirect = await this.page
      .goto('/finance/journal-entries/new', { waitUntil: 'domcontentloaded', timeout: 60000 })
      .then(() => true)
      .catch(() => false);
    if (!openedDirect) {
      // Fallback when direct route load is slow: open list first, then click New.
      await this.gotoList();
      await this.newEntryButton.click();
    }
    await expect(this.page).toHaveURL(/\/finance\/journal-entries\/new/, { timeout: 30000 });
    await expect(this.formHeading).toBeVisible({ timeout: 30000 });
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
    const listbox = this.page.locator('[role="listbox"]').last();
    await expect(listbox).toBeVisible({ timeout: 10000 });

    // Accounts can load asynchronously in JE form; wait briefly for options.
    await expect
      .poll(async () => listbox.getByRole('option').count(), {
        timeout: 20000,
        intervals: [300, 600, 1000],
        message: `No account options loaded for row ${rowIndex + 1}`,
      })
      .toBeGreaterThan(0);

    const matching = listbox.getByRole('option', { name: optionText }).first();
    const found = await matching.isVisible().catch(() => false);
    if (!found) {
      const preview: string[] = [];
      const options = listbox.getByRole('option');
      const cnt = await options.count();
      for (let i = 0; i < Math.min(cnt, 8); i++) {
        preview.push((await options.nth(i).innerText().catch(() => '')).trim());
      }
      throw new Error(
        `Account option ${String(optionText)} not found in JE row ${rowIndex + 1}. First options: ${preview.join(' | ')}`
      );
    }
    await matching.click();
  }

  async selectAccountByOptionIndex(rowIndex: number, optionIndex: number): Promise<void> {
    const row = this.lineRow(rowIndex);
    const trigger = row.locator('[role="combobox"]').first();
    await trigger.click();
    const listbox = this.page.locator('[role="listbox"]').last();
    await expect(listbox).toBeVisible({ timeout: 10000 });
    const options = listbox.getByRole('option');
    await expect
      .poll(async () => options.count(), { timeout: 20000, intervals: [300, 600, 1000] })
      .toBeGreaterThan(optionIndex);
    await options.nth(optionIndex).click();
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
