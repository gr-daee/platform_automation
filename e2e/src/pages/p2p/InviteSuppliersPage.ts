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

  /**
   * Wait until the client finishes loading RFQ + supplier lists. Until then the page only shows
   * a spinner and "Loading..." — do not assert on Invite buttons before this.
   */
  async waitForPageReady(): Promise<void> {
    // Main title is <h1>; "Available Suppliers" is in shadcn CardTitle which renders as <div>, not role=heading.
    await expect(this.page.getByRole('heading', { name: /Invite Suppliers/i })).toBeVisible({
      timeout: 45000,
    });
    await expect(this.page.getByText('Available Suppliers', { exact: true })).toBeVisible({
      timeout: 30000,
    });
    console.log('✅ [P2P] Invite Suppliers page ready (supplier list loaded)');
  }

  async goto(rfqId: string): Promise<void> {
    await this.page.goto(`/p2p/rfq/${rfqId}/invite`);
    await this.page.waitForLoadState('networkidle');
    await this.waitForPageReady();
    console.log(`✅ [P2P] Navigated to Invite Suppliers for RFQ ${rfqId}`);
  }

  /** Invite the first available (non-invited) supplier. Returns true if invited, false if none to invite. */
  async inviteFirstAvailableSupplier(): Promise<boolean> {
    await this.waitForPageReady();

    const btn = this.inviteButton;
    if ((await btn.count()) === 0 || !(await btn.first().isVisible().catch(() => false))) {
      console.log('✅ [P2P] No supplier to invite (all invited or none found)');
      return false;
    }
    await btn.first().click();
    // UI sets success then reloads data (loading spinner); Sonner may not fire — inline alert is hidden while loading.
    await this.waitForPageReady();
    console.log('✅ [P2P] Invited first available supplier');
    return true;
  }

  /** Invite up to `count` distinct suppliers (one Invite click per row). Returns number actually invited. */
  async inviteSuppliersUpTo(count: number): Promise<number> {
    let invited = 0;
    for (let i = 0; i < count; i++) {
      const ok = await this.inviteFirstAvailableSupplier();
      if (!ok) break;
      invited++;
    }
    console.log(`✅ [P2P] Invited ${invited} supplier(s) (requested up to ${count})`);
    return invited;
  }
}
