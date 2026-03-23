/**
 * Programmatic O2C flow (Indent → SO → Picklist → E-Invoice) for self-contained scenarios
 * (e.g. e-invoice cancellation when no recent IRN exists in DB).
 */

import { expect, type Page } from '@playwright/test';
import { IndentsPage } from '../pages/o2c/IndentsPage';
import { IndentDetailPage } from '../pages/o2c/IndentDetailPage';
import { SalesOrderDetailPage } from '../pages/o2c/SalesOrderDetailPage';
import { WarehousePicklistDialogPage } from '../pages/o2c/WarehousePicklistDialogPage';
import { getSalesOrderIdByIndentId, getInvoiceIdsBySalesOrderId } from './o2c-db-helpers';

export type RunO2CFlowParams = {
  dealerName: string;
  productCode?: string;
  productCodes?: string[];
  warehouseName: string;
  transporterName: string;
  approvalComment: string;
  /** When true, uncheck "E-Way Bill Required" and use "Generate E-Invoice Only". */
  eInvoiceWithoutEWayBill: boolean;
};

export async function runO2CIndentThroughEInvoice(
  page: Page,
  p: RunO2CFlowParams
): Promise<{ indentId: string; salesOrderId: string; invoiceId: string | null }> {
  const indentsPage = new IndentsPage(page);
  await indentsPage.navigate();
  await indentsPage.clickCreateIndent();
  await indentsPage.searchDealer(p.dealerName);
  await indentsPage.selectDealer(p.dealerName);
  await expect(page).toHaveURL(/\/o2c\/indents\/[a-f0-9-]+/, { timeout: 15000 });

  const detail = new IndentDetailPage(page);
  await detail.verifyDetailPageLoaded();
  await detail.clickEdit();
  const productCodes = (p.productCodes && p.productCodes.length > 0 ? p.productCodes : [p.productCode || '1013']).filter(
    Boolean
  );
  for (const code of productCodes) {
    await detail.clickAddItems();
    await detail.searchProduct(code);
    await detail.waitForAddProductsSearchComplete();
    await detail.selectFirstProductAndAdd();
    await detail.waitForSuccessToast(/added|product/i).catch(() => {});
  }
  await detail.clickSave();
  await detail.waitForSuccessToast(/items updated|updated successfully/i).catch(() => {});
  await page.waitForTimeout(500);
  await detail.clickSubmitIndent();
  await detail.waitForSuccessToast(/submitted/i);

  await detail.clickSelectWarehouse();
  await detail.selectWarehouseByName(p.warehouseName);
  await page.waitForTimeout(800);
  await detail.selectTransporterByName(p.transporterName);

  await detail.clickApprove();
  await detail.fillApprovalCommentsAndSubmit(p.approvalComment);
  // Same as indent-steps: partial stock opens Stock Availability Warning → Approve Anyway
  const stockDlg = page.getByRole('dialog', { name: /stock availability warning/i });
  try {
    await expect(stockDlg).toBeVisible({ timeout: 12000 });
    const approveAnyway = stockDlg.getByRole('button', { name: /approve anyway/i });
    await expect(approveAnyway).toBeVisible({ timeout: 10000 });
    await approveAnyway.click();
    await expect(stockDlg).toBeHidden({ timeout: 120000 });
  } catch {
    // sufficient stock — dialog not shown
  }
  await detail.waitForApprovalSuccess();

  await detail.clickProcessWorkflow();
  await detail.clickConfirmAndProcess();
  await detail.waitForSuccessToast(/processed|workflow|sales order|back order/i).catch(() => {});
  await page.waitForTimeout(1500);

  const url = page.url();
  const match = url.match(/\/o2c\/indents\/([a-f0-9-]+)/);
  expect(match).toBeTruthy();
  const indentId = match![1];

  let soId: string | null = null;
  for (let attempt = 1; attempt <= 15; attempt++) {
    soId = await getSalesOrderIdByIndentId(indentId);
    if (soId) break;
    await page.waitForTimeout(2000);
  }
  expect(soId).toBeTruthy();

  const soPage = new SalesOrderDetailPage(page);
  await soPage.goto(soId!);
  await soPage.verifyPageLoaded();

  const ensurePicklistCompletedIfNeeded = async (): Promise<void> => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const canGenerate = await soPage.generatePicklistButton.isVisible().catch(() => false);
      const canView = await soPage.viewPicklistButton.isVisible().catch(() => false);
      const canGenerateInvoice = await soPage.generateEInvoiceButton.isVisible().catch(() => false);
      const canViewInvoice = await soPage.viewEInvoiceButton.isVisible().catch(() => false);

      if (canGenerate) {
        await soPage.clickGeneratePicklist();
        await soPage.clickViewPicklist();
        const pickModal = new WarehousePicklistDialogPage(page);
        await pickModal.waitForLoaded();
        await pickModal.clickStartPickingProcessIfVisible();
        await pickModal.openPickItemsTab();
        await pickModal.pickAllItemsWithBatchConfirm();
        await pickModal.clickCompletePicklist();
        await pickModal.confirmCompletePicklistInAlert();
        await pickModal.waitForDialogClosed();
        await soPage.goto(soId!);
        await soPage.verifyPageLoaded();
        return;
      }

      if (canView) {
        await soPage.clickViewPicklist();
        const pickModal = new WarehousePicklistDialogPage(page);
        await pickModal.waitForLoaded();
        await pickModal.clickStartPickingProcessIfVisible();
        await pickModal.openPickItemsTab();
        await pickModal.pickAllItemsWithBatchConfirm();
        await pickModal.clickCompletePicklist();
        await pickModal.confirmCompletePicklistInAlert();
        await pickModal.waitForDialogClosed();
        await soPage.goto(soId!);
        await soPage.verifyPageLoaded();
        return;
      }

      // Picklist may already be complete and SO can directly generate/view invoice.
      if (canGenerateInvoice || canViewInvoice) return;

      if (attempt < 3) {
        await page.waitForTimeout(2000);
        await soPage.goto(soId!);
        await soPage.verifyPageLoaded();
      }
    }
  };

  await ensurePicklistCompletedIfNeeded();

  await soPage.clickGenerateEInvoice();
  const modal = page.getByRole('dialog').filter({ has: page.getByText(/e-invoice|transport|invoice/i) });
  await expect(modal).toBeVisible({ timeout: 10000 });
  const transportTab = page.getByRole('tab', { name: /transport/i }).first();
  await transportTab.click();
  await page.waitForTimeout(500);

  if (p.eInvoiceWithoutEWayBill) {
    const ewayCheckbox = modal.locator('#eWayBillRequired');
    if (await ewayCheckbox.isVisible().catch(() => false)) {
      await ewayCheckbox.setChecked(false);
    }
    const genOnly = modal.getByRole('button', { name: /generate e-invoice only/i });
    await genOnly.click();
  } else {
    const combobox = modal.getByRole('combobox').filter({ has: page.getByText(/transporter|shipper/i) }).first();
    if (await combobox.isVisible().catch(() => false)) {
      await combobox.click();
      await page.waitForTimeout(300);
      const option = page.getByRole('option', {
        name: new RegExp(p.transporterName.replace(/\s+/g, '\\s*'), 'i'),
      });
      if (await option.isVisible().catch(() => false)) {
        await option.click();
      }
    }
    const generateBtn = modal.getByRole('button', { name: /^generate e-invoice$/i }).first();
    await generateBtn.click();
  }

  const generatingButton = modal.getByRole('button', { name: /generating.*invoice/i });
  await expect(generatingButton).toBeVisible({ timeout: 10000 }).catch(() => {});
  await expect(generatingButton).toBeHidden({ timeout: 40000 }).catch(() => {});
  await expect(modal).toBeHidden({ timeout: 10000 }).catch(() => {});

  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await soPage.waitForInvoiceLink(40000);
  await soPage.goto(soId!);
  await soPage.verifyPageLoaded();

  const ids = await getInvoiceIdsBySalesOrderId(soId!);
  const invoiceId = ids[0] ?? null;

  return { indentId, salesOrderId: soId!, invoiceId };
}
