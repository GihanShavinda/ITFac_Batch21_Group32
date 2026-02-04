Feature: Plants Management
  Verifies plant list and add-plant flows for admin.

  Background:
    Given I am logged in as admin
    And I navigate to plants page

  @smoke
  Scenario: View all plants
    Then I should see list of plants

  # TC_UI_PLT_ADMIN_01: Add plant with valid data
  # Preconditions: Admin logged in; a sub-category exists.
  # Expected: Plant added, redirect to /ui/plants, new plant appears in list.
  @smoke @TC_UI_PLT_ADMIN_01
  Scenario: Add plant with valid data
    When I click the Add Plant button
    Then I should be on the Add Plant page
    When I enter plant name "Rose"
    And I select the first sub-category for plant
    And I enter plant price 10
    And I enter plant quantity 5
    And I click Save on the plant form
    Then I should be redirected to the plant list page
    And I should see the plant "Rose" in the list