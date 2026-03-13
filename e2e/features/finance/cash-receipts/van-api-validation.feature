# VAN API Validation - Axis Bank VAN validation (TC_ABP_01-04)
# Source: Test plan Phase 5.2; Test Cases - VAN.csv; Signature Utility

Feature: VAN API Validation
  As the system I validate VAN payments via Axis Bank API
  so that only valid dealer VANs and amounts are accepted.

  @FIN-VAN-TC-001 @smoke @critical @p0
  Scenario: Valid VAN validation succeeds
    When I send VAN validation request with VAN "IACS1234" and amount "5000.00"
    Then VAN validation should succeed with dealer

  @FIN-VAN-TC-002 @negative
  Scenario: Invalid VAN is rejected
    When I send VAN validation request with VAN "INVALID_VAN_999" and amount "5000.00"
    Then VAN validation should fail with message containing "invalid"

  @FIN-VAN-TC-003 @security
  Scenario: Invalid signature is rejected
    When I send VAN validation request with invalid signature
    Then VAN validation should fail with message containing "signature"

  @FIN-VAN-TC-004 @edge
  Scenario: Inactive dealer VAN is rejected
    When I send VAN validation request with VAN "INACTIVE_VAN" and amount "5000.00"
    Then VAN validation should fail with message containing "inactive"
