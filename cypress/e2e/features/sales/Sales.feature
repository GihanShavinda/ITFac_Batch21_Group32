Feature: Sales Management
  
  Background:
    Given I am logged in as sales manager
    And I navigate to sales page

  @smoke
  Scenario: View all sales
    Then I should see list of sales orders