@plant-production @PLANT-P4
Feature: Quality Control — Production Anomalies (DAEE-168)

  Background:
    Given I am on the Quality Control page

  @PLANT-QC-TC-001 @smoke @p1 @iacs-md @PLANT-P4
  Scenario: Quality Control page loads with anomaly list
    Then the Quality Control page should be visible
    And the production anomalies list should be displayed

  @PLANT-QC-TC-002 @smoke @p1 @iacs-md @PLANT-P4
  Scenario: Report a production anomaly
    When I open the Report Anomaly dialog
    And I select anomaly type "Quality Issue"
    And I select severity Medium
    And I submit the anomaly form
    Then I should see an anomaly reported success toast
    And the anomaly should appear in the list

  @PLANT-QC-TC-003 @regression @p1 @iacs-md @PLANT-P4
  Scenario: Anomaly severity defaults to medium on create
    When I open the Report Anomaly dialog
    Then the severity should default to medium

  @PLANT-QC-TC-004 @regression @p1 @iacs-md @PLANT-P4
  Scenario: Acknowledge a production anomaly
    Given I have created a test anomaly
    When I acknowledge the created anomaly
    Then the anomaly should show as acknowledged

  @PLANT-QC-TC-005 @regression @p2 @iacs-md @PLANT-P4
  Scenario: Delete a production anomaly
    Given I have created a test anomaly
    When I delete the created anomaly
    Then the anomaly should not appear in the list

  @PLANT-QC-TC-006 @regression @p2 @iacs-md @PLANT-P4
  Scenario: Filter anomalies by severity
    Given I have created a test anomaly
    When I filter anomalies by severity Medium
    Then the medium severity anomaly should be visible

  @PLANT-QC-TC-007 @regression @p2 @iacs-md @PLANT-P4
  Scenario: Anomaly type options include all expected types
    When I open the Report Anomaly dialog
    Then the anomaly type dropdown should contain "Quality Issue"
    And the anomaly type dropdown should contain "Equipment Failure"
    And the anomaly type dropdown should contain "Production Delay"
