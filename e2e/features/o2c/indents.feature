Feature: O2C Indent Management
  As a dealer manager
  I want to create and manage indents
  So that I can process dealer orders efficiently

  # Intended User Context (for future multi-user implementation):
  # - User: IACS MD User (md@idhyahagri.com)
  # - Tenant: IACS
  # - Role: Managing Director
  # 
  # Current: Using Super Admin (super-admin@daee.in) via pre-authenticated session
  # TODO: Implement proper multi-user auth to test as IACS MD User

  @O2C-INDENT-TC-012 @regression @dealer-search @iacs-tenant
  Scenario: User searches and selects dealer from Create Indent modal
    Given I am on the O2C Indents page
    When I click the Create Indent button
    Then I should see the "Select Dealer" modal
    And the modal should display a list of active dealers
    And the modal should have a search input
    When I search for dealer by name "Green Valley"
    Then the dealer list should be filtered
    And I should see "Green Valley" in the results
    When I select the dealer "Green Valley Agri Center"
    Then the modal should close
    And I should be on the indent creation page with dealer pre-selected
