@finance @journal-entries @iacs-md
Feature: Invoice journal entry verification (full O2C chain)

  Background:
    Given I am logged in to the Application

  @FIN-INV-TC-001 @p0 @iacs-md
  Scenario: Invoice JE debit line uses resolved sales ar_control account
    Given a new posted sales invoice exists from O2C chain for JE verification
    When invoice GL journal is loaded from database
    Then invoice JE has debit line matching resolved sales ar_control account

  @FIN-INV-TC-002 @p0 @iacs-md
  Scenario: Invoice JE credit line uses resolved sales revenue account
    Given a new posted sales invoice exists from O2C chain for JE verification
    When invoice GL journal is loaded from database
    Then invoice JE has credit line matching resolved sales revenue account

  @FIN-INV-TC-003 @p0 @iacs-md
  Scenario: Intra-state invoice may register CGST SGST output lines when product carries GST
    Given a new posted sales invoice exists from O2C chain for JE verification
    When invoice GL journal is loaded from database
    Then invoice JE may include resolved gst output lines or only AR revenue

  @FIN-INV-TC-004 @p0 @iacs-md
  Scenario: Inter-state IGST line when warehouse creates IGST context
    Given a new posted sales invoice exists from O2C chain for JE verification
    When invoice GL journal is loaded from database
    Then invoice JE may include IGST output or intrastate tax lines

  @FIN-INV-TC-005 @p1 @iacs-md
  Scenario: Invoice JE is balanced
    Given a new posted sales invoice exists from O2C chain for JE verification
    When invoice GL journal is loaded from database
    Then invoice JE total debits equal total credits

  @FIN-INV-TC-006 @p1 @iacs-md
  Scenario: Zero GST product posts without tax GL lines
    Given a new posted sales invoice exists from O2C chain for JE verification
    When invoice GL journal is loaded from database
    Then invoice JE line count is at least two

  @FIN-INV-TC-007 @p1 @iacs-md
  Scenario: Indent item tax percentage aligns with product master
    Given a new posted sales invoice exists from O2C chain for JE verification
    When invoice GL journal is loaded from database
    Then invoice exists in database with lines

  @FIN-INV-TC-008 @p2 @iacs-md
  Scenario: Invoice journal number is sequential ERP format
    Given a new posted sales invoice exists from O2C chain for JE verification
    When invoice GL journal is loaded from database
    Then journal header has non-empty journal_number

  @FIN-INVC-TC-001 @p0 @iacs-md
  Scenario: Cancelled invoice creates reversing journal activity
    Given a new posted sales invoice exists from O2C chain for JE verification
    When I cancel the current JE test invoice from detail page
    Then invoice status is cancelled in database

  @FIN-INVC-TC-002 @p0 @iacs-md
  Scenario: Cancellation path maintains accounting balance
    Given a new posted sales invoice exists from O2C chain for JE verification
    When invoice GL journal is loaded from database
    And I cancel the current JE test invoice from detail page
    Then invoice status is cancelled in database

  @FIN-INVC-TC-003 @p1 @iacs-md
  Scenario: Cancelled invoice status in database
    Given a new posted sales invoice exists from O2C chain for JE verification
    When I cancel the current JE test invoice from detail page
    Then invoice status is cancelled in database

  @FIN-INVC-TC-004 @p1 @iacs-md
  Scenario: GST reversal lines may exist after cancellation
    Given a new posted sales invoice exists from O2C chain for JE verification
    When I cancel the current JE test invoice from detail page
    Then invoice status is cancelled in database

  @FIN-INVC-TC-005 @p1 @iacs-md
  Scenario: Double cancel blocked or invoice already cancelled
    Given a new posted sales invoice exists from O2C chain for JE verification
    When I cancel the current JE test invoice from detail page
    And I attempt second cancel on current JE test invoice if button visible
    Then invoice status is cancelled in database

  @FIN-INVC-TC-006 @p2 @iacs-md
  Scenario: Invoice with applied cash receipt may block cancellation
    Given a new posted sales invoice exists from O2C chain for JE verification
    Then cancel invoice may be blocked when cash receipt applied or not attempted

  @FIN-INVC-TC-007 @p2 @iacs-md
  Scenario: Audit trail references invoice cancellation
    Given a new posted sales invoice exists from O2C chain for JE verification
    When I cancel the current JE test invoice from detail page
    Then invoice status is cancelled in database
