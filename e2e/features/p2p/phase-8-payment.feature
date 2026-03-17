# Phase 8: Payment (DAEE-159)
# Source: https://linear.app/daee-issues/issue/DAEE-159/phase-8-payment-user-story
# Full scenarios to be added when step definitions are implemented.

Feature: Phase 8 - Payment
  As a Finance User
  I want to verify bank details, release payment, and reconcile to invoice and bank
  So that supplier is paid correctly, compliance is maintained, and AP is closed accurately.

  Background:
    Given I am logged in to the Application

  @P2P-P8-TC-001 @p1 @smoke @iacs-md
  Scenario: View payment queue with marked invoices
    Given I am on the "p2p/payment-queue" page
    Then I should see the "Payment Queue" heading
    And I should see the list or empty state
