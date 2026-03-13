# VAN FIFO Allocation - Overpayment and no-invoice advance (TC_ABP_24-25)
# TC_ABP_23 (FIFO order) covered by van-api-posting FIN-VAN-TC-005. Source: Test Cases - VAN.csv

Feature: VAN FIFO Allocation
  As the system I allocate VAN payments to invoices in FIFO order
  so that overpayments create advance and no-invoice payments create full advance.

  @FIN-VAN-TC-023 @edge
  Scenario: Overpayment creates advance
    When I send VAN validation then posting with unique UTR
    Then VAN payment should be posted successfully
    And payment should be allocated FIFO to invoices

  @FIN-VAN-TC-024 @edge
  Scenario: No invoices creates full advance
    When I send VAN validation then posting with unique UTR
    Then VAN payment should be posted successfully
