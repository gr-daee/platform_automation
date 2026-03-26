Feature: Dealers list city visibility
  As a business user
  I want dealer city to be visible in the dealers list
  So that I can identify dealer location directly from the UI

  Background:
    Given I am logged in to the Application

  @DAEE-347 @regression @p1 @iacs-md
  Scenario: Dealers list shows city in Region/Territory/City column
    When I open dealers list page
    Then the dealers list should show "Region / Territory / City" column
    And at least one dealer row should display city in the location column
