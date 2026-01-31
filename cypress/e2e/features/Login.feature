Feature: Login Functionality
  As a user
  I want to login to the application

  Background:
    Given I navigate to the login page

  @smoke
  Scenario: Successful login
    When I enter username "admin@test.com"
    And I enter password "password123"
    And I click on login button
    Then I should be redirected to the dashboard