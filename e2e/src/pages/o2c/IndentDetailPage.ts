import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';
import { DialogComponent } from '../../support/components/DialogComponent';
import { PollingHelper } from '../../support/helpers/PollingHelper';

/**
 * O2C Indent Detail Page Object Model
 *
 * Source: ../web_app/src/app/o2c/indents/[id]/page.tsx
 *         ../web_app/src/app/o2c/components/EnhancedEditableItemsCard.tsx
 *         ../web_app/src/app/o2c/components/WarehouseSelector.tsx
 *
 * Purpose: Indent detail – edit, add product, save, submit, warehouse, approve/reject, process workflow.
 */
export class IndentDetailPage extends BasePage {
  private dialogComponent: DialogComponent;

  // Header
  readonly backButton: Locator;
  readonly pageHeading: Locator; // "{dealer} - Indent"

  // Draft actions
  readonly editButton: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly submitIndentButton: Locator;

  // Approval actions (submitted status)
  readonly approveButton: Locator;
  readonly rejectButton: Locator;

  // Approved actions
  readonly processWorkflowButton: Locator;

  // Cards
  readonly indentInformationHeading: Locator;
  readonly warehouseSelectionHeading: Locator;
  readonly warehouseSelectButton: Locator; // "Select Warehouse" or "Change"

  // Add product (visible in edit mode)
  readonly addItemsButton: Locator;

  // Approval dialog
  readonly approvalDialog: Locator;
  readonly approvalDialogTitle: Locator;
  readonly approvalCommentsTextarea: Locator;
  readonly approvalDialogSubmitButton: Locator; // Approve or Reject
  readonly approvalDialogCancelButton: Locator;

  // Add Products modal
  readonly addProductsModal: Locator;
  readonly addProductsSearchInput: Locator;
  readonly addProductsModalAddButton: Locator; // button to confirm add

  // Warehouse dialog
  readonly warehouseDialog: Locator;
  readonly warehouseDialogTitle: Locator;

  // Transporter Selection (submitted indent only)
  readonly transporterSelectionHeading: Locator;
  readonly transporterSelectTrigger: Locator;
  readonly transporterSelectedLabel: Locator;

  // Process Workflow dialog
  readonly processWorkflowDialog: Locator;
  readonly confirmAndProcessButton: Locator;

    // Status badge (Indent Information card)
    readonly statusBadge: Locator;

  // Block 2: Line items and totals (edit mode)
  readonly itemsTable: Locator;
  readonly totalAmountParagraph: Locator;

  constructor(page: Page) {
    super(page);
    this.dialogComponent = new DialogComponent(page);

    this.backButton = page.getByRole('button', { name: /back/i });
    this.pageHeading = page.getByRole('heading', { name: /indent$/i });

    this.editButton = page.getByRole('button', { name: /^edit$/i });
    this.saveButton = page.getByRole('button', { name: /^save$/i });
    this.cancelButton = page.getByRole('button', { name: /^cancel$/i });
    this.submitIndentButton = page.getByRole('button', { name: /submit indent/i });

    this.approveButton = page.getByRole('button', { name: /^approve/i }); // "Approve" or "Approve with Back Orders"
    this.rejectButton = page.getByRole('button', { name: /^reject$/i });
    this.processWorkflowButton = page.getByRole('button', { name: /process workflow/i });

    // CardTitle may render as div, not heading; use text
    this.indentInformationHeading = page.getByText(/indent information/i).first();
    this.warehouseSelectionHeading = page.getByText(/warehouse selection/i).first();
    this.warehouseSelectButton = page.getByRole('button', { name: /select warehouse|change/i });

    // "Add Items" and "Add Your First Item" both open the modal; use first to avoid strict mode
    this.addItemsButton = page.getByRole('button', { name: /add items|add your first item/i }).first();

    this.approvalDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /approve indent|reject indent/i }),
    });
    this.approvalDialogTitle = this.approvalDialog.getByRole('heading', { name: /approve indent|reject indent/i });
    this.approvalCommentsTextarea = this.approvalDialog.getByPlaceholder(/approval comments|reason for rejection/i);
    this.approvalDialogCancelButton = this.approvalDialog.getByRole('button', { name: /^cancel$/i });
    this.approvalDialogSubmitButton = this.approvalDialog.getByRole('button', { name: /^approve$|^reject$/i });

    this.addProductsModal = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /add products to indent/i }),
    });
    this.addProductsSearchInput = this.addProductsModal.getByPlaceholder(/search products, variants, packages/i);

    this.warehouseDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /select preferred warehouse/i }),
    });
    this.warehouseDialogTitle = this.warehouseDialog.getByRole('heading', { name: /select preferred warehouse/i });

    // Transporter Selection (submitted indent only)
    this.transporterSelectionHeading = page.getByText(/Transporter Selection/i).first();
    this.transporterSelectTrigger = page.getByPlaceholder(/Select transporter for delivery/i).first();
    this.transporterSelectedLabel = this.transporterSelectionHeading.locator('..').locator('..').getByText(/Selected:/i).first();

    this.processWorkflowDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /process/i }),
    });
    this.confirmAndProcessButton = this.processWorkflowDialog.getByRole('button', { name: /confirm & process/i });

    this.statusBadge = page.getByText(/indent information/i)
      .locator('..')
      .locator('..')
      .getByText(/draft|submitted|approved|rejected/i)
      .first();

    // Items table: main content table with line items (Product Package Variant / Quantity)
    this.itemsTable = page.getByRole('main').getByRole('table').filter({
      has: page.getByText(/Product Package Variant|Quantity|Codes/i),
    }).first();
    this.totalAmountParagraph = page.getByRole('main').locator('label').filter({ hasText: /Total Amount/i }).locator('..').locator('p').first();
  }

  /**
   * Navigate to indent detail by id (optional; often we land here from list/create)
   */
  async navigate(indentId: string): Promise<void> {
    await this.navigateTo(`/o2c/indents/${indentId}`);
  }

  /**
   * Verify detail page is loaded: heading and Indent Information card
   */
  async verifyDetailPageLoaded(): Promise<void> {
    await expect(this.pageHeading).toBeVisible({ timeout: 10000 });
    await expect(this.backButton).toBeVisible();
    await expect(this.indentInformationHeading).toBeVisible({ timeout: 10000 });
  }

  /**
   * Click Back to return to indents list
   */
  async clickBack(): Promise<void> {
    await this.backButton.click();
  }

  /**
   * Enter edit mode (draft only)
   */
  async clickEdit(): Promise<void> {
    await this.editButton.click();
  }

  /**
   * Save edit (visible in edit mode)
   */
  async clickSave(): Promise<void> {
    await this.saveButton.click();
  }

  /**
   * Cancel edit (visible in edit mode)
   */
  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  /**
   * Click Add Items to open Add Products modal (must be in edit mode for draft)
   */
  async clickAddItems(): Promise<void> {
    await this.addItemsButton.click();
    await expect(this.addProductsModal).toBeVisible({ timeout: 5000 });
  }

  /**
   * Wait for Add Products modal initial list to load (before searching).
   * Use after opening the modal to avoid performance-related timeouts: the app loads
   * an initial product list first; wait for it (or "no results") then search.
   */
  async waitForAddProductsInitialList(): Promise<void> {
    await PollingHelper.pollUntil(
      async () => await this.hasAddProductsResults() || await this.isAddProductsModalShowingNoResults(),
      { timeout: 15000, interval: 500, description: 'Add Products modal initial list to load' }
    );
  }

  /**
   * In Add Products modal: search by product name or code
   */
  async searchProduct(searchTerm: string): Promise<void> {
    await this.addProductsSearchInput.fill(searchTerm);
    await this.page.waitForTimeout(600);
  }

  /**
   * Open Add Products modal and search (no selection). Use before asserting results or no results.
   * Waits for initial list to load before searching to avoid performance-related timeouts.
   */
  async openAddProductsAndSearch(searchTerm: string): Promise<void> {
    await this.clickAddItems();
    await this.waitForAddProductsInitialList();
    await this.searchProduct(searchTerm);
  }

  /**
   * Check if Add Products modal shows "No products match" / "No Products Found" (empty search result).
   */
  async isAddProductsModalShowingNoResults(): Promise<boolean> {
    const noProductsHeading = this.addProductsModal.getByRole('heading', { name: /no products found/i });
    const noMatchText = this.addProductsModal.getByText(/no products match/i);
    const visible = await noProductsHeading.isVisible().catch(() => false) || await noMatchText.isVisible().catch(() => false);
    return visible;
  }

  /**
   * Verify Add Products modal shows no matching products (empty search result).
   * Use .first() to avoid strict mode when both heading "No Products Found" and paragraph match.
   */
  async verifyAddProductsModalShowingNoResults(): Promise<void> {
    await this.page.waitForTimeout(800);
    await expect(this.addProductsModal.getByText(/no products match|no products found/i).first()).toBeVisible({ timeout: 10000 });
  }

  /**
   * Check if Add Products modal has at least one product row/card (filtered results).
   */
  async hasAddProductsResults(): Promise<boolean> {
    const tableRows = this.addProductsModal.locator('tbody tr');
    const cardItems = this.addProductsModal.getByRole('row').filter({ hasNot: this.page.getByText('Product Package Variant') });
    const tableCount = await tableRows.count();
    if (tableCount > 0) return true;
    const rowCount = await this.addProductsModal.locator('[class*="divide-y"] > div').count();
    return rowCount > 0;
  }

  /**
   * Verify Add Products modal shows at least one product (after search).
   * Polls for results: modal uses table on desktop and card/divide-y on mobile.
   */
  async verifyAddProductsModalHasResults(): Promise<void> {
    await this.page.waitForTimeout(800);
    await PollingHelper.pollUntil(
      async () => await this.hasAddProductsResults(),
      { timeout: 12000, interval: 500, description: 'Add Products modal to show at least one product' }
    );
  }

  /**
   * Wait for Add Products search to complete: either at least one row (results or "Already Added")
   * or "no matching products" is shown. Call before selectFirstProductAndAdd() so the modal is not
   * closed before results load.
   */
  async waitForAddProductsSearchComplete(): Promise<void> {
    await PollingHelper.pollUntil(
      async () => await this.hasAddProductsResults() || await this.isAddProductsModalShowingNoResults(),
      { timeout: 12000, interval: 500, description: 'Add Products modal search to complete (results or no results)' }
    );
  }

  /**
   * In Add Products modal: select first selectable product (click row), then click Add button.
   * Rows with "Already Added" are not selectable. If all results are "Already Added" (e.g. existing draft
   * opened with items), close modal and return — indent already has the product.
   */
  async selectFirstProductAndAdd(): Promise<void> {
    const addableRow = this.addProductsModal.locator('tbody tr').filter({ hasNot: this.page.getByText('Already Added') }).first();
    const found = await addableRow.isVisible().catch(() => false);
    if (!found) {
      await this.closeAddProductsModal();
      return;
    }
    await addableRow.click({ timeout: 5000 });
    await this.page.waitForTimeout(300);
    const addBtn = this.addProductsModal.getByRole('button', { name: /^Add(\s*\(\d+\))?$/i });
    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click({ timeout: 5000 });
    } else {
      await this.closeAddProductsModal();
    }
  }

  /**
   * In Add Products modal: select up to N selectable products (click each row), then click Add button if any selected.
   * Rows with "Already Added" are skipped. If no addable rows (e.g. existing draft with items), close modal and return.
   */
  async selectNProductsAndAdd(n: number): Promise<void> {
    const selectableRows = this.addProductsModal.locator('tbody tr').filter({ hasNot: this.page.getByText('Already Added') });
    const cardItems = this.addProductsModal.locator('[class*="divide-y"] > div').filter({ hasNot: this.page.getByText('Already Added') });
    const tableCount = await selectableRows.count();
    const cardCount = await cardItems.count();
    const available = Math.max(tableCount, cardCount);
    if (available === 0) {
      await this.closeAddProductsModal();
      return;
    }
    const toSelect = Math.min(n, available);
    for (let i = 0; i < toSelect; i++) {
      if (tableCount > 0) {
        await selectableRows.nth(i).click({ timeout: 8000 });
      } else {
        await cardItems.nth(i).click({ timeout: 8000 });
      }
      await this.page.waitForTimeout(200);
    }
    const addBtn = this.addProductsModal.getByRole('button', { name: /^Add(\s*\(\d+\))?$/i });
    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click({ timeout: 5000 });
    } else {
      await this.closeAddProductsModal();
    }
  }

  /**
   * Count of line items on indent detail (table body rows in items table).
   */
  async getIndentLineItemCount(): Promise<number> {
    const rows = this.itemsTable.locator('tbody tr');
    return await rows.count();
  }

  /**
   * Set quantity for the first line item (edit mode). Uses first number input in items table.
   */
  async setFirstLineItemQuantity(qty: number): Promise<void> {
    const firstRow = this.itemsTable.locator('tbody tr').first();
    const qtyInput = firstRow.locator('input[type="number"], input[inputmode="numeric"], input').first();
    await qtyInput.fill(String(qty));
    await this.page.waitForTimeout(400);
  }

  /**
   * Get displayed Total Amount from the page (parses ₹X,XXX.XX).
   */
  async getDisplayedTotalAmount(): Promise<number> {
    await expect(this.totalAmountParagraph).toBeVisible({ timeout: 5000 });
    const text = await this.totalAmountParagraph.textContent();
    const match = text?.replace(/,/g, '').match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  /**
   * Close Add Products modal (X or Cancel if present)
   */
  async closeAddProductsModal(): Promise<void> {
    const closeBtn = this.addProductsModal.getByRole('button', { name: /close|cancel/i }).first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
    } else {
      await this.page.keyboard.press('Escape');
    }
  }

  /**
   * Submit indent (draft with items). Waits for success toast.
   */
  async clickSubmitIndent(): Promise<void> {
    await this.submitIndentButton.click();
  }

  /**
   * Open warehouse selector (submitted indent). Clicks "Select Warehouse" button.
   */
  async clickSelectWarehouse(): Promise<void> {
    await this.warehouseSelectButton.click();
    await expect(this.warehouseDialog).toBeVisible({ timeout: 8000 });
  }

  /**
   * In warehouse dialog: select warehouse by name (clicks card containing that text).
   * Waits for warehouse list to load; matches full name or first word (e.g. "Kurnook" if "Kurnook Warehouse" not found).
   */
  async selectWarehouseByName(warehouseName: string): Promise<void> {
    await expect(this.warehouseDialog).toBeVisible({ timeout: 8000 });
    await this.warehouseDialog.getByText(/\d+%/).first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    const nameRegex = new RegExp(warehouseName.replace(/\s+/g, '\\s*'), 'i');
    const fullNameLocator = this.warehouseDialog.getByText(nameRegex).first();
    const firstWord = warehouseName.trim().split(/\s+/)[0];
    const firstWordRegex = new RegExp(firstWord, 'i');
    const firstWordLocator = this.warehouseDialog.getByText(firstWordRegex).first();
    if (await fullNameLocator.isVisible().catch(() => false)) {
      await fullNameLocator.click({ timeout: 5000 });
    } else {
      await firstWordLocator.click({ timeout: 15000 });
    }
    await expect(this.warehouseDialog).toBeHidden({ timeout: 8000 });
  }

  /**
   * Select first warehouse in dialog (first card).
   * Warehouse list loads asynchronously after dialog opens; wait for first card to appear then click.
   */
  async selectFirstWarehouse(): Promise<void> {
    await this.warehouseDialog.getByText(/\d+%/).first().waitFor({ state: 'visible', timeout: 25000 });
    const firstCard = this.warehouseDialog.locator('div[class*="cursor-pointer"][class*="transition-all"]').first();
    await firstCard.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Click Approve button (opens approval dialog)
   */
  async clickApprove(): Promise<void> {
    await this.approveButton.click();
    await expect(this.approvalDialog).toBeVisible({ timeout: 5000 });
    await expect(this.approvalDialog.getByRole('heading', { name: /approve indent/i })).toBeVisible();
  }

  /**
   * Click Reject button (opens approval dialog)
   */
  async clickReject(): Promise<void> {
    await this.rejectButton.click();
    await expect(this.approvalDialog).toBeVisible({ timeout: 5000 });
    await expect(this.approvalDialog.getByRole('heading', { name: /reject indent/i })).toBeVisible();
  }

  /**
   * Fill approval/reject comments and submit dialog
   */
  async fillApprovalCommentsAndSubmit(comments: string): Promise<void> {
    await this.approvalCommentsTextarea.fill(comments);
    await this.approvalDialogSubmitButton.click();
  }

  /**
   * Submit approval dialog without comments (Approve – optional comments)
   */
  async submitApprovalDialog(): Promise<void> {
    await this.approvalDialogSubmitButton.click();
  }

  /**
   * Cancel approval dialog
   */
  async cancelApprovalDialog(): Promise<void> {
    await this.approvalDialogCancelButton.click();
  }

  /**
   * Click Process Workflow (approved indent)
   */
  async clickProcessWorkflow(): Promise<void> {
    await this.processWorkflowButton.click();
    await expect(this.processWorkflowDialog).toBeVisible({ timeout: 5000 });
  }

  /**
   * In Process Workflow dialog: confirm and process
   */
  async clickConfirmAndProcess(): Promise<void> {
    await this.confirmAndProcessButton.click();
  }

  /**
   * Check if Edit button is visible (draft)
   */
  async isEditVisible(): Promise<boolean> {
    return this.editButton.isVisible();
  }

  /**
   * Check if Submit Indent button is visible
   */
  async isSubmitIndentVisible(): Promise<boolean> {
    return this.submitIndentButton.isVisible();
  }

  /**
   * Check if Submit Indent is enabled
   */
  async isSubmitIndentEnabled(): Promise<boolean> {
    return this.submitIndentButton.isEnabled();
  }

  /**
   * Check if Warehouse Selection card is visible (submitted)
   */
  async isWarehouseSelectionVisible(): Promise<boolean> {
    return this.warehouseSelectionHeading.isVisible();
  }

  /**
   * Check if Approve button is visible
   */
  async isApproveVisible(): Promise<boolean> {
    return this.approveButton.isVisible();
  }

  /**
   * Check if Approve is disabled (e.g. warehouse not selected)
   */
  async isApproveDisabled(): Promise<boolean> {
    return this.approveButton.isDisabled();
  }

  /**
   * Check if Process Workflow button is visible (approved)
   */
  async isProcessWorkflowVisible(): Promise<boolean> {
    return this.processWorkflowButton.isVisible();
  }

  /**
   * Wait for success toast (e.g. after submit or approval)
   */
  async waitForSuccessToast(message?: string | RegExp): Promise<void> {
    const toast = message
      ? this.page.locator('[data-sonner-toast]').filter({ hasText: message })
      : this.page.locator('[data-sonner-toast]');
    await expect(toast).toBeVisible({ timeout: 10000 });
  }

  /**
   * Wait for approval success: either success toast containing "approved" or status badge showing Approved.
   * Use when the app may show toast or only update the status badge.
   */
  async waitForApprovalSuccess(): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast]').filter({ hasText: /approved/i });
    try {
      await expect(toast).toBeVisible({ timeout: 15000 });
    } catch {
      await expect(this.statusBadge).toBeVisible({ timeout: 5000 });
      await expect(this.statusBadge).toContainText(/approved/i);
    }
  }

  /**
   * Verify indent status badge shows Rejected (after reject flow).
   */
  async verifyStatusRejected(): Promise<void> {
    await expect(this.statusBadge).toBeVisible({ timeout: 10000 });
    await expect(this.statusBadge).toContainText(/rejected/i);
  }

  /**
   * Verify approval was blocked (e.g. 90+ days overdue): error toast or message, no success toast.
   * Waits briefly for success toast; if not found, checks for error/warning toast or dialog message.
   */
  async verifyApprovalBlocked(): Promise<void> {
    const successToast = this.page.locator('[data-sonner-toast]').filter({ hasText: /approved/i });
    await this.page.waitForTimeout(2000);
    await expect(successToast).not.toBeVisible();
    const errorOrBlocked = this.page.locator('[data-sonner-toast]').filter({
      hasText: /90|overdue|blocked|cannot approve|due invoice/i,
    });
    const hasError = await errorOrBlocked.isVisible().catch(() => false);
    if (!hasError) {
      const anyToast = this.page.locator('[data-sonner-toast]');
      await expect(anyToast).toBeVisible({ timeout: 3000 });
    }
  }

  /**
   * Verify Process Workflow dialog shows Sales Order and Back Order preview (split summary).
   * Use .first() to avoid strict mode when multiple elements match (e.g. heading and box text).
   */
  async verifyProcessWorkflowDialogShowsSOAndBOPreview(): Promise<void> {
    await expect(this.processWorkflowDialog).toBeVisible({ timeout: 8000 });
    await expect(this.processWorkflowDialog.getByText(/Sales Order/i).first()).toBeVisible();
    await expect(this.processWorkflowDialog.getByText(/Back Order/i).first()).toBeVisible();
  }

  /**
   * Close Process Workflow dialog without confirming (click Cancel).
   */
  async closeProcessWorkflowDialog(): Promise<void> {
    const cancelBtn = this.processWorkflowDialog.getByRole('button', { name: /^cancel$/i });
    await cancelBtn.click();
    await expect(this.processWorkflowDialog).toBeHidden({ timeout: 8000 });
  }

  /**
   * Check if Transporter Selection card is visible (submitted indent only).
   */
  async isTransporterSelectionVisible(): Promise<boolean> {
    return this.transporterSelectionHeading.isVisible();
  }

  /**
   * Open transporter dropdown and select first available transporter (Radix Select).
   */
  async selectFirstTransporter(): Promise<void> {
    const trigger = this.page.getByRole('combobox').filter({ has: this.page.getByText(/transporter|delivery/i) }).or(
      this.transporterSelectTrigger
    ).first();
    await trigger.click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    await this.page.getByRole('option').first().click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Check if a transporter is already selected (dealer default or user selection).
   * Waits briefly for async load of dealer preferred_transporter.
   */
  async hasTransporterPreSelected(): Promise<boolean> {
    await this.page.waitForTimeout(1500);
    const hasSelectedLabel = await this.transporterSelectedLabel.isVisible().catch(() => false);
    if (hasSelectedLabel) return true;
    return this.page.getByText(/Own Transport|default transporter/i).first().isVisible().catch(() => false);
  }
}
