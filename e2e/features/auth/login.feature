Feature: User Authentication with TOTP MFA

  As a DAEE platform user
  I want to securely log in with email, password, and TOTP
  So that my account is protected with two-factor authentication

  Background:
    Given I am on the login page

  @AUTH-LOGIN-TC-001 @smoke @critical
  Scenario: Successful login with valid TOTP for Admin user
    When I enter valid admin credentials
    And I submit the login form
    Then I should see the TOTP verification step
    When I generate and enter a valid TOTP code
    And I submit the TOTP verification
    Then I should see a success message
    And I should be redirected to the notes page

  @AUTH-LOGIN-TC-002 @smoke @critical
  Scenario: Login fails with invalid TOTP code
    When I enter valid admin credentials
    And I submit the login form
    Then I should see the TOTP verification step
    When I enter an invalid TOTP code "000000"
    And I submit the TOTP verification
    Then I should see an error message
    And I should remain on the TOTP verification step

  @AUTH-LOGIN-TC-003 @regression
  Scenario: Login fails with incorrect password
    When I enter admin email "admin@example.com"
    And I enter an incorrect password "WrongPassword123!"
    And I submit the login form
    Then I should see an error message
    And I should remain on the login page

  @AUTH-LOGIN-TC-004 @regression
  Scenario: Login form validation for empty fields
    When I submit the login form without entering credentials
    Then the login form should show validation errors
    And I should remain on the login page
