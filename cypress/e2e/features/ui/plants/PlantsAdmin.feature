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
    And I click the Add Plant button
    And I should be on the Add Plant page
    And I enter plant name "Rose"
    And I select the first sub-category for plant
    And I enter plant price 10
    And I enter plant quantity 5
    When I click Save on the plant form
    Then I should be redirected to the plant list page
    And I should see the plant "Rose" in the list

  # TC_UI_PLT_ADMIN_02: Validation errors (price ≤ 0)
  # Preconditions: Admin logged in; a sub-category exists.
  # Expected: Validation message below Price field; plant is not added.
  @TC_UI_PLT_ADMIN_02
  Scenario: Validation errors when price is zero or negative
    And I click the Add Plant button
    And I should be on the Add Plant page
    And I enter plant name for validation "Rose"
    And I select the first sub-category for plant
    And I enter plant price 0
    And I enter plant quantity 5
    When I click Save on the plant form
    Then I should see the validation message "Price must be greater than 0" below the Price field
    And I should remain on the Add Plant page

  # TC_UI_PLT_ADMIN_03: Edit plant
  # Preconditions: Admin logged in; at least one plant exists.
  # Expected: Plant details updated, redirect to list, updated plant shown.
  @smoke @TC_UI_PLT_ADMIN_03
  Scenario: Edit plant
    Given at least one plant exists in the system
    And I click Edit for the first plant in the list
    And I should be on the Edit Plant page
    When I change plant name to "Updated Rose"
    And I click Save on the plant form
    Then I should be redirected to the plant list page
    And I should see the plant "Updated Rose" in the list

  # TC_UI_PLT_ADMIN_04: Delete plant
  # Preconditions: Admin logged in; at least one plant exists.
  # Expected: Plant deleted and no longer in the list.
  @TC_UI_PLT_ADMIN_04
  Scenario: Delete plant
    Given at least one plant exists in the system
    And I remember the name of the first plant in the list
    When I click Delete for the first plant in the list
    And I confirm the deletion
    Then the plant should no longer appear in the list

  # TC_UI_PLT_ADMIN_05: Low stock badge validation
  # Preconditions: Admin logged in; at least one plant with quantity < 5 exists.
  # Expected: "Low" badge displayed for plants with stock < 5.
  @TC_UI_PLT_ADMIN_05
  Scenario: Low stock badge is displayed for plants with quantity below 5
    Given a plant with quantity 4 exists in the system
    And I navigate to plants page
    Then I should see the "Low" badge for the low-stock plant we created