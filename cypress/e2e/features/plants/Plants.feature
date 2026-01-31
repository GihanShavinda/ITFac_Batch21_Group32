Feature: Plants Management
  
  Background:
    Given I am logged in as admin
    And I navigate to plants page

  @smoke
  Scenario: View all plants
    Then I should see list of plants