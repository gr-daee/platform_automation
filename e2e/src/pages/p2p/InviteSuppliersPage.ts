import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * Invite Suppliers Page (RFQ)
 *
 * Source: ../web_app/src/app/p2p/rfq/[id]/invite/components/InviteSuppliersPage.tsx
 *
 * Purpose: Invite suppliers to an RFQ for Phase 3 E2E (quote capture).
 */
export class InviteSuppliersPage extends BasePage {
  readonly inviteButton: Locator;

  constructor(page: Page) {
    super(page);
    this.inviteButton = page.getByRole('button', { name: 'Invite' }).first();
  }

  async goto(rfqId: string): Promise<void> {
    await this.page.goto(`/p2p/rfq/${rfqId}/invite`);
    await this.page.waitForLoadState('networkidle');
    console.log(`✅ [P2P] Navigated to Invite Suppliers for RFQ ${rfqId}`);
  }

  /** Invite the first available (non-invited) supplier. Returns true if invited, false if none to invite. */
  async inviteFirstAvailableSupplier(): Promise<boolean> {
    const btn = this.inviteButton;
    const visible = await btn.isVisible().catch(() => false);
    if (!visible) {
      console.log('✅ [P2P] No supplier to invite (all invited or none found)');
      return false;
    }
    await btn.click();
    await expect(
      this.page.locator('[data-sonner-toast]').filter({ hasText: /invited|success/i })
    ).toBeVisible({ timeout: 10000 });
    console.log('✅ [P2P] Invited first available supplier');
    return true;
  }
}
