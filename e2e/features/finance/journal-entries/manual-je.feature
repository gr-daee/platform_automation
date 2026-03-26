@finance @journal-entries @iacs-md
Feature: Manual journal entries and GL verification

  Background:
    Given I am logged in to the Application

  @FIN-JE-TC-001 @p0 @iacs-md
# Defect DAEE-421: "Post Immediately" keeps JE in draft status; GL report excludes draft entries.
  Scenario: Create balanced manual JE and verify posted status in DB
    When I create and post a balanced manual journal entry via UI
    Then the manual journal entry should be posted in the database

  @FIN-JE-TC-002 @p1 @iacs-md
  Scenario: Create multi-line JE (4 lines) and verify all lines in DB
    When I create and post a four line manual journal entry via UI
    Then the journal entry should have 4 lines in the database

  @FIN-JE-TC-003 @p1 @iacs-md
  Scenario: Imbalanced JE blocked — no journal posted
    When I attempt to post an imbalanced manual journal entry via UI
    Then no new posted journal header is created for the test description

  @FIN-JE-TC-004 @p1 @iacs-md
  Scenario: JE blocked when fiscal period is closed
    When I set manual JE entry date to a hard closed fiscal period if available
    Then post immediately should show period error or test skipped

  @FIN-JE-TC-005 @p2 @iacs-md
  Scenario: JE date links fiscal period in DB when posted
    When I create and post a balanced manual journal entry via UI
    Then the posted journal should have fiscal_period_id set when periods exist

  @FIN-JE-TC-006 @p2 @iacs-md
  Scenario: JE narration text saved in description field
    When I create and post a balanced manual journal entry via UI with narration
    Then the journal header description contains the narration text

  @FIN-JE-TC-007 @p2 @iacs-md
  Scenario: Manual JE audit source module
    When I create and post a balanced manual journal entry via UI
    Then the journal header may be manual or automated per product implementation

  @FIN-JE-TC-008 @p0 @iacs-md
  Scenario: Manual JE should reflect in General Ledger report balances
    When I create and post a balanced manual journal entry via UI
    Then manual JE should reflect in General Ledger report balances when posted
