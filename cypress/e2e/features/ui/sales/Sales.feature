# cypress/e2e/features/ui/sales/Sales.feature
Feature: Sales Management UI

  Background:
    Given I am logged in as admin
    And I navigate to sales page

  # ===== ADMIN UI TESTS (8 tests) =====

  @smoke @TC_UI_SALES_ADMIN_01
  Scenario: TC_UI_SALES_ADMIN_01 - Verify Sales List page loads for admin
    Then I should see the page title "Sales"
    And I should see "Sell Plant" button
    And I should see sales table with columns "Plant" "Quantity" "Total Price" "Sold At" "Actions"

  @TC_UI_SALES_ADMIN_02
  Scenario: TC_UI_SALES_ADMIN_02 - Verify pagination controls display
    Given there are more than 10 sales records
    Then I should see pagination controls
    And I should see first 10 sales records

  @TC_UI_SALES_ADMIN_03
  Scenario: TC_UI_SALES_ADMIN_03 - Verify sorting by Plant name
    Given multiple sales exist
    When I click on "Plant" column header
    Then sales should be sorted by plant name

  @TC_UI_SALES_ADMIN_04
  Scenario: TC_UI_SALES_ADMIN_04 - Verify Plant dropdown shows stock
    When I click "Sell Plant" button
    Then I should see Plant dropdown default state
    And only plants with stock should be displayed in dropdown

  @TC_UI_SALES_ADMIN_05
  Scenario: TC_UI_SALES_ADMIN_05 - Verify successful sale creation
    When I click "Sell Plant" button
    And I select a plant with stock from dropdown
    And I enter valid quantity
    And I click "Sell" button
    Then I should see success message "Plant sold successfully"
    And I should be redirected to sales list

  @TC_UI_SALES_ADMIN_06
  Scenario: TC_UI_SALES_ADMIN_06 - Verify error for quantity exceeds stock
    When I click "Sell Plant" button
    And I select a plant with stock from dropdown
    And I enter quantity greater than stock
    And I click "Sell" button
    Then I should see error message about stock availability
    And sale should not be created in database

  @TC_UI_SALES_ADMIN_07
  Scenario: TC_UI_SALES_ADMIN_07 - Verify successful sale deletion
    Given a sale exists for a plant
    When I click delete icon and confirm
    Then I should see success message "Sale deleted successfully"
    And the sale should be removed from list

  @TC_UI_SALES_ADMIN_08
  Scenario: TC_UI_SALES_ADMIN_08 - Verify cancel deletion action
    Given a sale exists for a plant
    When I click delete icon and cancel
    Then the sale should NOT be deleted from database
    And the sale should remain in the sales list

  # ===== USER UI TESTS (5 tests) =====

  @TC_UI_SALES_USER_01
  Scenario: TC_UI_SALES_USER_01 - Verify Sales List page for User role
    Given I am logged in as user
    And I navigate to sales page
    Then I should see the page title "Sales"
    And I should see sales table with columns "Plant" "Quantity" "Total Price" "Sold At"
    But I should NOT see "Sell Plant" button
    And I should NOT see Actions column

  @TC_UI_SALES_USER_02
  Scenario: TC_UI_SALES_USER_02 - Verify User read-only access
    Given I am logged in as user
    And I navigate to sales page
    Then I should see read-only sales list
    And no admin actions should be visible

  @TC_UI_SALES_USER_03
  Scenario: TC_UI_SALES_USER_03 - Verify User can sort sales
    Given I am logged in as user
    And I navigate to sales page
    And multiple sales exist
    When I click on "Plant" column header
    Then sales should be sorted by plant name

  @TC_UI_SALES_USER_04
  Scenario: TC_UI_SALES_USER_04 - Verify no sales found message
    Given I am logged in as user
    And I navigate to sales page
    And no sales exist
    Then I should see message "No sales found"

  @TC_UI_SALES_USER_05
  Scenario: TC_UI_SALES_USER_05 - Verify User pagination works
    Given I am logged in as user
    And I navigate to sales page
    And there are more than 10 sales records
    Then I should see pagination controls