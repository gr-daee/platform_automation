# VAN EPD Discount - Early Payment Discount (TC_ABP_14-17 consolidated)
# Source: Test Cases - VAN.csv. Slab-specific scenarios (7d/8-15d/30d) use same flow; distinct data TBD.

Feature: VAN EPD Discount
  As the system I calculate EPD discount for VAN payments based on slab and payment date
  so that early payment discounts are applied correctly.

  @FIN-VAN-TC-014 @critical @p0
  Scenario: EPD discount calculated for VAN payment
    When I send VAN validation then posting with unique UTR
    Then VAN payment should be posted successfully
    And EPD discount should be calculated correctly

  @FIN-VAN-TC-015 @edge
  Scenario: VAN payment allocated FIFO when no EPD
    When I send VAN validation then posting with unique UTR
    Then VAN payment should be posted successfully
    And payment should be allocated FIFO to invoices
