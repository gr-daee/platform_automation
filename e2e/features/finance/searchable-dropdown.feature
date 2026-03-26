Feature: Searchable dropdown regression across key modules
  As a business user
  I want dropdowns to support inline search
  So that I can quickly find values in long option lists

  Background:
    Given I am logged in to the Application

  @CA-39-FULL @regression @p1 @iacs-md
  Scenario Outline: Page has at least one searchable dropdown
    When I open page "<Path>"
    And I prepare CA39 context for page "<Path>"
    Then page should expose a searchable combobox with query "<Query>"

    Examples:
      | Path                                                 | Query      |
      | /finance/audit-trail                                | action     |
      | /finance/adjustments                                | approved   |
      | /finance/credit-memos                               | applied    |
      | /finance/compliance/gstr1                           | feb        |
      | /finance/reports/profit-loss                        | current    |
      | /finance/reports/day-book                           | ledger     |
      | /finance/reports/group-summary                      | region     |
      | /finance/reports/dealer-outstanding                 | territory  |
      | /finance/trial-balance                              | summary    |
      | /finance/balance-sheet                              | monthly    |
      | /finance/profit-loss                                | monthly    |
      | /finance/fiscal-periods                             | period     |
      | /finance/epd-summary                                | amount     |
      | /finance/epd-calculator                             | scheme     |
      | /finance/ar-aging                                   | bucket     |
      | /finance/payments/create                            | cash       |
      | /finance/ap-invoices/new                            | supplier   |
      | /o2c/audit                                          | status     |
      | /o2c/back-orders                                    | pending    |
      | /inventory/reports/batch-tracking                   | warehouse  |
      | /inventory/reports/inter-warehouse-transfer         | source     |
      | /inventory/reports/inventory-health                 | product    |
      | /inventory/reports/stock-movement                   | movement   |
      | /inventory/reports/inventory-ledger                 | material   |
      | /crm/gamified-rebate/dashboard                      | campaign   |
      | /plant-production/quality                           | status     |
      | /admin/modules/price-lists/create                   | currency   |
      | /admin/roles/create                                 | tenant     |
      | /p2p/procurement-requests/create                    | priority   |
      | /p2p/supplier-invoices/create                       | supplier   |
