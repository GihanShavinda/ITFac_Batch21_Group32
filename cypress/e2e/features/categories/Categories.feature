Feature: Categories Management
  
  Background:
    Given I am logged in as admin
    And I navigate to categories page

  @smoke
  Scenario: View all categories
    Then I should see list of categories