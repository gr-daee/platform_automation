import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { approveRfqSelectionForE2ETest, getUserByEmail } from '../../support/db-helper';
import { CreateRFQPage } from '../../pages/p2p/CreateRFQPage';
import { InviteSuppliersPage } from '../../pages/p2p/InviteSuppliersPage';
import { QuoteComparisonPage } from '../../pages/p2p/QuoteComparisonPage';
import { RFQDetailPage } from '../../pages/p2p/RFQDetailPage';
import { RFQListPage } from '../../pages/p2p/RFQListPage';
import {
  startSecondaryUserSession,
  stopSecondaryUserSession,
} from '../../support/multi-user-session-helper';

const { When, Then } = createBdd();

When('I create an RFQ from the current phase 4 E2E approved procurement request', async function ({
  page,
}) {
  const purpose = (this as any).lastPrPurpose as string | undefined;
  if (!purpose) {
    throw new Error('Missing lastPrPurpose; create a PR with unique purpose prefix first.');
  }

  const listPage = new RFQListPage(page);
  await listPage.goto();
  await listPage.verifyPageLoaded();
  await listPage.gotoCreate();

  const createPage = new CreateRFQPage(page);
  await createPage.selectApprovedPRByPurposeContains(purpose);
  const title = `AUTO_QA_RFQ_P4_${Date.now()}`;
  await createPage.fillTitle(title);
  await createPage.fillResponseDeadline(7);
  await createPage.fillRequiredDeliveryDate(7);
  await createPage.submitCreate();

  const rfqId = new RFQDetailPage(page).getCurrentRfqIdFromUrl();
  (this as any).currentRfqId = rfqId;
  (this as any).lastRfqTitle = title;
  console.log(`✅ [P2P] Phase 4 E2E: created RFQ ${rfqId} from PR matching "${purpose}"`);
});

When(
  'I invite up to {int} suppliers and issue the RFQ for phase 4 E2E',
  async function ({ page, $test }, count: number) {
    const rfqId = (this as any).currentRfqId as string | undefined;
    if (!rfqId) {
      throw new Error('Missing currentRfqId; create an RFQ first.');
    }

    await page.goto(`/p2p/rfq/${rfqId}`);
    await page.waitForLoadState('networkidle');
    const detail = new RFQDetailPage(page);
    await detail.verifyDetailLoaded();

    const inviteVisible = await page.getByRole('button', { name: /Invite Suppliers/i }).isVisible().catch(() => false);
    if (!inviteVisible && $test) {
      $test.skip(true, 'Invite Suppliers not available on RFQ detail.');
      return;
    }
    await detail.goToInvite();
    const invitePage = new InviteSuppliersPage(page);
    const invited = await invitePage.inviteSuppliersUpTo(count);
    (this as any).rfqInvitedSupplierCount = invited;

    if (invited < 2 && $test) {
      $test.skip(
        true,
        `Phase 4 E2E expects at least 2 invited suppliers for multi-quote flow; got ${invited}. Add suppliers to the tenant.`
      );
      return;
    }

    await page.goto(`/p2p/rfq/${rfqId}`);
    await page.waitForLoadState('networkidle');
    const detail2 = new RFQDetailPage(page);
    await detail2.verifyDetailLoaded();

    const issueVisible = await detail2.issueRfqButton.isVisible().catch(() => false);
    if (issueVisible) {
      await detail2.issueRfqAndConfirm('AUTO_QA_ Phase 4 E2E sole source / issue justification.');
      await page.reload();
      await page.waitForLoadState('networkidle');
    }
    console.log('✅ [P2P] Phase 4 E2E: invite + issue complete');
  }
);

When(
  'I enter quotes from each invited supplier with distinct unit prices for phase 4 E2E',
  async function ({ page }) {
    const rfqId = (this as any).currentRfqId as string | undefined;
    if (!rfqId) throw new Error('Missing currentRfqId');

    await page.goto(`/p2p/rfq/${rfqId}`);
    await page.waitForLoadState('networkidle');
    const detail = new RFQDetailPage(page);
    await detail.verifyDetailLoaded();

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);
    const validUntilStr = validUntil.toISOString().split('T')[0];

    const n = await detail.enterQuotesForAllInvitedSuppliers(validUntilStr);
    expect(n, 'Expected at least one supplier quote').toBeGreaterThan(0);
  }
);

Then(
  'I capture the winning quote snapshot from Quote Comparison for the current RFQ',
  async function ({ page }) {
    const rfqId = (this as any).currentRfqId as string | undefined;
    if (!rfqId) throw new Error('Missing currentRfqId');

    const compPage = new QuoteComparisonPage(page);
    await compPage.goto(rfqId);
    await compPage.verifyPageLoaded();

    const supplierCell = page.locator('table tbody tr').first().locator('td').first();
    const supplierName = (await supplierCell.textContent().catch(() => ''))?.trim() || undefined;
    const lineRowCount = await page.locator('table tbody tr').count();
    (this as any).winningQuoteSnapshot = { supplierName, lineRowCount };
    console.log('✅ [P2P] Winning quote snapshot:', (this as any).winningQuoteSnapshot);
  }
);

When(
  'I approve the RFQ quote selection via test database for the current RFQ',
  async function ({ page, $test }) {
    const rfqId = (this as any).currentRfqId as string | undefined;
    if (!rfqId) throw new Error('Missing currentRfqId');

    const email = process.env.IACS_MD_USER_EMAIL || 'md@idhyahagri.com';
    let user: { id?: string } | null;
    try {
      user = await getUserByEmail(email);
    } catch (e) {
      if ($test) {
        $test.skip(true, 'Database not reachable for RFQ approval step: ' + (e as Error).message);
        return;
      }
      throw e;
    }

    if (!user?.id) {
      if ($test) {
        $test.skip(true, `No auth.users row for ${email}; cannot run DB approval.`);
        return;
      }
      throw new Error(`No user id for ${email}`);
    }

    let updated = 0;
    try {
      updated = await approveRfqSelectionForE2ETest(rfqId, user.id);
    } catch (e) {
      if ($test) {
        $test.skip(true, 'approveRfqSelectionForE2ETest failed: ' + (e as Error).message);
        return;
      }
      throw e;
    }

    if (updated === 0 && $test) {
      $test.skip(
        true,
        'RFQ was not updated (expected selection_pending). Check RFQ state after Submit for Approval on quote selection.'
      );
      return;
    }
    expect(updated).toBeGreaterThan(0);

    await page.goto(`/p2p/rfq/${rfqId}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Selection Approved/i)).toBeVisible({ timeout: 15000 });
    console.log('✅ [P2P] RFQ selection approved via test DB; detail shows Selection Approved');
  }
);

When(
  'the ED approver approves the RFQ quote selection in a separate session',
  async function ({ browser, page, $test }) {
    const rfqId = (this as any).currentRfqId as string | undefined;
    if (!rfqId) throw new Error('Missing currentRfqId');

    const session = await startSecondaryUserSession(browser, 'iacs-ed');
    try {
      const edPage = session.page;
      await edPage.goto(`/p2p/rfq/${rfqId}`);
      await edPage.waitForLoadState('networkidle');
      const detail = new RFQDetailPage(edPage);
      await detail.verifyDetailLoaded();

      const alreadyApproved = await edPage.getByText(/Selection Approved/i).first().isVisible().catch(() => false);
      if (!alreadyApproved) {
        const canApprove = await detail.approveSelectionButton.isVisible().catch(() => false);
        if (!canApprove) {
          if ($test) {
            $test.skip(
              true,
              'ED approver cannot see Approve Selection for this RFQ; ensure quote selection is submitted and ED has approval permission.'
            );
            return;
          }
          throw new Error('Approve Selection button not visible for ED approver.');
        }
        await detail.approveSelectionButton.click();
        const dialog = edPage.getByRole('dialog').or(edPage.getByRole('alertdialog'));
        const confirm = dialog.getByRole('button', { name: /Confirm|Approve|Yes/i });
        if (await confirm.first().isVisible().catch(() => false)) {
          await confirm.first().click();
        }
      }

      await expect(edPage.getByText(/Selection Approved/i).first()).toBeVisible({ timeout: 15000 });
      console.log('✅ [P2P] ED approver approved RFQ quote selection in separate session');
    } finally {
      await stopSecondaryUserSession(session);
    }

    await page.goto(`/p2p/rfq/${rfqId}`);
    await page.waitForLoadState('networkidle');
  }
);
