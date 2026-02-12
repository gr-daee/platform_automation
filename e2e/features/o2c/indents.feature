Feature: O2C Indent Management
  As a dealer manager
  I want to create and manage indents
  So that I can process dealer orders efficiently

  Background:
    Given I am logged in as "IACS MD User"

  @O2C-INDENT-TC-012 @regression @dealer-search @iacs-tenant @iacs-md
  Scenario: User searches and selects dealer from Create Indent modal
    Given I am on the O2C Indents page
    When I click the Create Indent button
    Then I should see the "Select Dealer" modal
    And the modal should display a list of active dealers
    And the modal should have a search input
    When I search for dealer by name "VAYUPUTRA AGENCIES"
    Then the dealer list should be filtered
    And I should see "VAYUPUTRA AGENCIES" in the results
    When I select the dealer "VAYUPUTRA AGENCIES"
    Then the modal should close
    And I should be on the indent creation page with dealer pre-selected
