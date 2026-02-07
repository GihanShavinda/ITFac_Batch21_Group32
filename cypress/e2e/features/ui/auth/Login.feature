# cypress/e2e/features/ui/auth/Login.feature
Feature: Login Functionality
  As a user
  I want to login to the application

  Background:
    Given I navigate to the login page

  @smoke
  Scenario: Successful login
    When I enter username "admin"
    And I enter password "admin123"
    And I click on login button
    Then I should be redirected to the dashboard
 