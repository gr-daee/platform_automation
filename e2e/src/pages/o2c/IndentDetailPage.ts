import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';
import { DialogComponent } from '../../support/components/DialogComponent';

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

  // Process Workflow dialog
  readonly processWorkflowDialog: Locator;
  readonly confirmAndProcessButton: Locator;

  // Status badge (Indent Information card)
  readonly statusBadge: Locator;

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

    this.processWorkflowDialog = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: /process/i }),
    });
    this.confirmAndProcessButton = this.processWorkflowDialog.getByRole('button', { name: /confirm & process/i });

    this.statusBadge = page.getByText(/indent information/i)
      .locator('..')
      .locator('..')
      .getByText(/draft|submitted|approved|rejected/i)
      .first();
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
   * In Add Products modal: search by product name or code
   */
  async searchProduct(searchTerm: string): Promise<void> {
    await this.addProductsSearchInput.fill(searchTerm);
    await this.page.waitForTimeout(600);
  }

  /**
   * Open Add Products modal and search (no selection). Use before asserting results or no results.
   */
  async openAddProductsAndSearch(searchTerm: string): Promise<void> {
    await this.clickAddItems();
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
   */
  async verifyAddProductsModalShowingNoResults(): Promise<void> {
    await expect(this.addProductsModal.getByText(/no products match|no products found/i)).toBeVisible({ timeout: 8000 });
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
   */
  async verifyAddProductsModalHasResults(): Promise<void> {
    await this.page.waitForTimeout(600);
    const rowCount = await this.addProductsModal.locator('tbody tr').count();
    expect(rowCount).toBeGreaterThan(0);
  }

  /**
   * In Add Products modal: select first selectable product (click row), then click Add button.
   * Table body rows are selectable; header row has "Product Package Variant". Rows with "Already Added" are not selectable.
   */
  async selectFirstProductAndAdd(): Promise<void> {
    const tableBodyRow = this.addProductsModal.locator('tbody tr').filter({ hasNot: this.page.getByText('Already Added') }).first();
    await tableBodyRow.click({ timeout: 10000 });
    await this.page.waitForTimeout(300);
    const addBtn = this.addProductsModal.getByRole('button', { name: /^Add(\s*\(\d+\))?$/i });
    await addBtn.click({ timeout: 5000 });
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
   * In warehouse dialog: select warehouse by name (clicks card containing that text)
   */
  async selectWarehouseByName(warehouseName: string): Promise<void> {
    await this.warehouseDialog.getByText(new RegExp(warehouseName, 'i')).first().click();
    await this.dialogComponent.waitForClose(this.warehouseDialog);
  }

  /**
   * Select first warehouse in dialog (first card/row)
   */
  async selectFirstWarehouse(): Promise<void> {
    const card = this.warehouseDialog.getByRole('generic').filter({ has: this.page.getByText(/\d+%/i) }).first();
    await card.click();
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
}
