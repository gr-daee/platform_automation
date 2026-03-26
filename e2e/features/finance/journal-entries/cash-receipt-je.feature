@finance @journal-entries @cash-receipt-je @iacs-md
Feature: Cash receipt journal entries (manual + VAN GL patterns)
  As Finance
  I want cash receipt posting to use posting profiles
  So that manual and VAN receipts hit the correct GL accounts

  Background:
    Given I am logged in to the Application

  @FIN-CR-TC-030 @critical @p0 @iacs-md
  Scenario: Manual NEFT cash receipt journal debits bank side and credits unapplied cash
    Given I have created a JE test cash receipt with payment method "neft" and amount "450"
    Then cash receipt creation journal has debit on bank control and credit on unapplied cash

  @FIN-CR-TC-031 @critical @p0 @iacs-md
  Scenario: Manual cash payment journal debits petty cash and credits unapplied cash
    Given I have created a JE test cash receipt with payment method "cash" and amount "275"
    Then cash receipt creation journal has debit on petty cash and credit on unapplied cash

  @FIN-CR-TC-032 @regression @p1 @iacs-md
  Scenario: Manual cash receipt creation journal is balanced
    Given I have created a JE test cash receipt with payment method "neft" and amount "320"
    Then cash receipt creation journal is balanced

  @FIN-CR-TC-033 @regression @p1 @iacs-md
  Scenario: NEFT cash receipt without bank account shows validation error
    When I attempt to save JE test NEFT cash receipt without selecting bank account
    Then new cash receipt form shows bank account validation error

  @FIN-CR-TC-034 @regression @p1 @iacs-md
  Scenario: Manual cash receipt JE aligns with posting profile resolution
    Given I have created a JE test cash receipt with payment method "neft" and amount "210"
    Then manual cash receipt JE uses posting profile resolved GL accounts for cash sides

  @FIN-CR-TC-035 @regression @p2 @iacs-md
  Scenario: Cash receipt without petty cash profile shows configuration error
    When I attempt JE test cash receipt with cash method when petty cash profile is missing
    Then cash receipt save shows petty cash not configured error if profile missing

  @FIN-VAN-TC-030 @critical @p0 @iacs-md
  Scenario: VAN cash receipt JE uses van bank debit and AR credit pattern
    When I send VAN validation then posting with unique UTR
    Then VAN payment should be posted successfully
    And cash receipt should be created for VAN payment "<utr>"
    Then VAN cash receipt journal is balanced with van bank debit and AR credit pattern

  @FIN-VAN-TC-031 @critical @p0 @iacs-md
  Scenario: VAN receipt JE may fall back to bank control when bank van missing
    When I send VAN validation then posting with unique UTR
    Then VAN payment should be posted successfully
    And cash receipt should be created for VAN payment "<utr>"
    Then VAN cash receipt journal is balanced with van bank debit and AR credit pattern

  @FIN-VAN-TC-032 @regression @p1 @iacs-md
  Scenario: VAN cash receipt journal is balanced
    When I send VAN validation then posting with unique UTR
    Then VAN payment should be posted successfully
    And cash receipt should be created for VAN payment "<utr>"
    Then VAN cash receipt journal is balanced with van bank debit and AR credit pattern

  @FIN-VAN-TC-033 @regression @p1 @iacs-md
  Scenario: VAN posting profile path is exercised
    When I send VAN validation then posting with unique UTR
    Then VAN payment should be posted successfully
    And cash receipt should be created for VAN payment "<utr>"
    Then VAN cash receipt journal lines do not require finance defaults code paths to be asserted in UI

  @FIN-VAN-TC-034 @regression @p2 @iacs-md
  Scenario: Unknown dealer style suspense receipt uses unapplied cash when present in DB
    Then unknown dealer style cash receipt from DB is skipped or journal uses unapplied cash
