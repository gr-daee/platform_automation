import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * Quality Control Page Object Model
 *
 * Source: ../web_app/src/app/plant-production/quality-control/
 * Components: QualityControlManagerPage.tsx, AnomalyFormDialog.tsx, AnomalyDetailsDialog.tsx
 *
 * Covers:
 * - Production Anomalies list with severity/type filters
 * - Create anomaly (AnomalyFormDialog)
 * - View anomaly details
 * - Acknowledge, Resolve, Mark as False Positive actions
 * - Delete anomaly
 */
export class QualityControlPage extends BasePage {
  readonly url = '/plant-production/quality-control';

  readonly searchInput: Locator;
  readonly newAnomalyButton: Locator;

  get dialog(): Locator { return this.page.getByRole('dialog'); }

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByPlaceholder('Search anomalies...');
    this.newAnomalyButton = page.getByRole('button', { name: /Report Anomaly|New Anomaly|Add Anomaly/i });
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
    console.log('✅ [QC] Navigated to Quality Control page');
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(
      this.page.getByText(/Production Anomalies|Quality Control/i).first()
    ).toBeVisible({ timeout: 15000 });
    // Wait for page loading spinner to clear (use specific large spinner, not the logo spinner)
    const pageSpinner = this.page.locator('.animate-spin.rounded-full.h-12');
    const isSpinnerVisible = await pageSpinner.isVisible({ timeout: 2000 }).catch(() => false);
    if (isSpinnerVisible) {
      await pageSpinner.waitFor({ state: 'hidden', timeout: 15000 });
    }
    console.log('✅ [QC] Quality Control page loaded');
  }

  // ── Create Anomaly Dialog ────────────────────────────────────────────────────

  async openCreateAnomalyDialog(): Promise<void> {
    await this.newAnomalyButton.click();
    await this.dialog.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(500);
    console.log('✅ [QC] Anomaly form dialog opened');
  }

  async closeDialogForce(): Promise<void> {
    const isOpen = await this.dialog.isVisible().catch(() => false);
    if (isOpen) {
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(300);
    }
    if (await this.dialog.isVisible().catch(() => false)) {
      await this.goto();
    }
  }

  async fillAnomalyTitle(title: string): Promise<void> {
    const titleInput = this.dialog.getByLabel(/Title|Anomaly Title/i);
    await titleInput.fill(title);
    console.log(`✅ [QC] Filled anomaly title: ${title}`);
  }

  async fillAnomalyDescription(desc: string): Promise<void> {
    const descInput = this.dialog.getByLabel(/Description/i);
    if (await descInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await descInput.fill(desc);
      console.log(`✅ [QC] Filled description`);
    }
  }

  async selectAnomalyType(type: string): Promise<void> {
    const select = this.dialog.getByRole('combobox').first();
    await select.click();
    await this.page.getByRole('option', { name: new RegExp(type, 'i') }).first().click();
    console.log(`✅ [QC] Selected anomaly type: ${type}`);
  }

  async selectSeverity(severity: string): Promise<void> {
    // Severity might be radio buttons or a select
    const radio = this.dialog.getByRole('radio', { name: new RegExp(severity, 'i') });
    const radioVisible = await radio.isVisible({ timeout: 2000 }).catch(() => false);
    if (radioVisible) {
      await radio.click();
      console.log(`✅ [QC] Selected severity via radio: ${severity}`);
      return;
    }
    // Try select combobox
    const selects = this.dialog.getByRole('combobox');
    const count = await selects.count();
    for (let i = 0; i < count; i++) {
      await selects.nth(i).click();
      const option = this.page.getByRole('option', { name: new RegExp(severity, 'i') });
      const optionVisible = await option.isVisible({ timeout: 1000 }).catch(() => false);
      if (optionVisible) {
        await option.click();
        console.log(`✅ [QC] Selected severity: ${severity}`);
        return;
      }
      await this.page.keyboard.press('Escape');
    }
  }

  async submitAnomalyForm(): Promise<void> {
    const submitBtn = this.dialog.getByRole('button', { name: /Submit|Create|Report/i }).last();
    await submitBtn.click();
    console.log('✅ [QC] Submitted anomaly form');
  }

  // ── List interactions ────────────────────────────────────────────────────────

  async getAnomalyRowByTitle(title: string): Promise<Locator> {
    return this.page.locator('table tbody tr').filter({ hasText: title }).first();
  }

  async clickViewAnomaly(title: string): Promise<void> {
    const row = await this.getAnomalyRowByTitle(title);
    await row.getByRole('button', { name: /View|Details/i }).click();
    await this.dialog.waitFor({ state: 'visible', timeout: 10000 });
    console.log(`✅ [QC] Viewing anomaly details: ${title}`);
  }

  async clickAcknowledgeAnomaly(title: string): Promise<void> {
    const row = await this.getAnomalyRowByTitle(title);
    await row.getByRole('button', { name: /Acknowledge/i }).click();
    await this.page.locator('[data-sonner-toast]').first().waitFor({ state: 'visible', timeout: 15000 });
    console.log(`✅ [QC] Acknowledged anomaly: ${title}`);
  }

  async clickDeleteAnomaly(title: string): Promise<void> {
    const row = await this.getAnomalyRowByTitle(title);
    await row.getByRole('button', { name: /Delete/i }).click();
    const confirmDialog = this.page.getByRole('dialog');
    await confirmDialog.waitFor({ state: 'visible', timeout: 5000 });
    await confirmDialog.getByRole('button', { name: 'Delete' }).click();
    await this.page.locator('[data-sonner-toast]').first().waitFor({ state: 'visible', timeout: 15000 });
    console.log(`✅ [QC] Deleted anomaly: ${title}`);
  }

  async verifyAnomalyInList(title: string): Promise<void> {
    const row = this.page.locator('table tbody tr').filter({ hasText: title });
    await expect(row.first()).toBeVisible({ timeout: 10000 });
    console.log(`✅ [QC] Anomaly visible in list: ${title}`);
  }

  async verifyAnomalyNotInList(title: string): Promise<void> {
    await this.page.waitForTimeout(500);
    const visible = await this.page.locator('table tbody tr').filter({ hasText: title }).isVisible().catch(() => false);
    expect(visible).toBe(false);
    console.log(`✅ [QC] Anomaly not visible in list: ${title}`);
  }

  async filterBySeverity(severity: string): Promise<void> {
    const select = this.page.getByRole('combobox').first();
    await select.click();
    await this.page.getByRole('option', { name: new RegExp(severity, 'i') }).first().click();
    await this.page.waitForTimeout(300);
    console.log(`✅ [QC] Filtered by severity: ${severity}`);
  }

  async waitForSuccessToast(): Promise<string> {
    const toast = this.page.locator('[data-sonner-toast]').first();
    await toast.waitFor({ state: 'visible', timeout: 60000 });
    return await toast.textContent() || '';
  }

  async getListRowCount(): Promise<number> {
    const spinner = this.page.locator('.animate-spin.rounded-full.h-12');
    const isSpinnerVisible = await spinner.isVisible({ timeout: 2000 }).catch(() => false);
    if (isSpinnerVisible) {
      await spinner.waitFor({ state: 'hidden', timeout: 15000 });
    }
    await this.page.waitForTimeout(300);
    const emptyState = await this.page.getByText(/No anomalies|No production anomalies/i).isVisible().catch(() => false);
    if (emptyState) return 0;
    return this.page.locator('table tbody tr').count();
  }
}
