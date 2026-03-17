import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * Create RFQ Page Object Model
 *
 * Source: ../web_app/src/app/p2p/rfq/create/CreateRFQForm.tsx
 *
 * Purpose: Select approved PR, set RFQ details and response deadline, submit (Phase 2).
 * Form has three date fields: Response Deadline, Quote Valid Until, Required Delivery Date.
 * Required Delivery Date is pre-filled from PR's required_by_date and must be >= today (min validation).
 */
export class CreateRFQPage extends BasePage {
  readonly heading: Locator;
  readonly prSelectTrigger: Locator;
  readonly titleInput: Locator;
  readonly responseDeadlineInput: Locator;
  readonly requiredDeliveryDateInput: Locator;
  readonly createRfqSubmitButton: Locator;
  readonly step1Heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Create RFQ' });
    this.prSelectTrigger = page.getByRole('combobox').first();
    this.titleInput = page.getByLabel(/RFQ Title/i);
    this.responseDeadlineInput = page.getByLabel(/Response Deadline/i);
    this.requiredDeliveryDateInput = page.locator('#required_delivery_date');
    this.createRfqSubmitButton = page.getByRole('button', { name: /Create RFQ/i });
    this.step1Heading = page.getByText('Step 1: Select Procurement Request');
  }

  async goto(): Promise<void> {
    await this.page.goto('/p2p/rfq/create');
    await this.page.waitForLoadState('networkidle');
    console.log('✅ [P2P] Navigated to Create RFQ page');
  }

  async selectFirstApprovedPR(): Promise<void> {
    await this.prSelectTrigger.click();
    await expect(this.page.getByRole('listbox')).toBeVisible({ timeout: 5000 });
    const firstOption = this.page.getByRole('option').first();
    await firstOption.click({ timeout: 5000 });
    await expect(this.page.getByText('Step 2: RFQ Details')).toBeVisible({ timeout: 5000 });
    console.log('✅ [P2P] Selected first approved PR');
  }

  async fillResponseDeadline(daysFromToday: number): Promise<void> {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    const dateStr = d.toISOString().slice(0, 10);
    await this.responseDeadlineInput.fill(dateStr);
    console.log(`✅ [P2P] Set response deadline: ${dateStr} (+${daysFromToday} days)`);
  }

  /** Required Delivery Date must be >= today (min validation). Overwrites PR default if it is in the past. */
  async fillRequiredDeliveryDate(daysFromToday: number): Promise<void> {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    const dateStr = d.toISOString().slice(0, 10);
    await this.requiredDeliveryDateInput.fill(dateStr);
    console.log(`✅ [P2P] Set required delivery date: ${dateStr} (+${daysFromToday} days)`);
  }

  async fillTitle(title: string): Promise<void> {
    await this.titleInput.fill(title);
    console.log(`✅ [P2P] Filled RFQ title: ${title}`);
  }

  async submitCreate(): Promise<void> {
    await expect(this.createRfqSubmitButton).toBeEnabled({ timeout: 5000 });
    await this.createRfqSubmitButton.click();
    await this.page.waitForURL(/\/p2p\/rfq\/[^/]+$/, { timeout: 15000 });
    console.log('✅ [P2P] Submitted Create RFQ');
  }

}
