Feature: Categories View Management
  Verifies category viewing UI elements for Admin on the Categories View page

  @ui @admin @smoke @TC_UI_CAT_ADMIN_01
  Scenario: TC_UI_CAT_ADMIN_01 - Verify Categories page UI elements (Admin)
    Given I am logged in as admin
    When I navigate to categories view page
    Then the search input should be visible
    And the "All Parents" dropdown should be visible
    And the Search button should be visible
    And the Reset button should be visible
    And the "Add A Category" button should be visible
    And the table should contain columns ID, Name, Parent, Actions

  @ui @admin @TC_UI_CAT_ADMIN_02
  Scenario: TC_UI_CAT_ADMIN_02 - Search functionality works
    Given I am logged in as admin
    And a category named "flower" exists
    When I navigate to categories view page
    And I enter "flower" in the search field
    And I click the Search button on categories view
    Then the search result should contain "flower"

  @ui @admin @TC_UI_CAT_ADMIN_03
  Scenario: TC_UI_CAT_ADMIN_03 - Search categories by valid category name
    Given I am logged in as admin
    And I navigate to categories view page
    When I enter a valid category name "Flowering" in the search field
    And I click the Search button
    Then the table should display only matching categories

  @ui @admin @TC_UI_CAT_ADMIN_04
  Scenario: TC_UI_CAT_ADMIN_04 - Search categories by invalid category name
    Given I am logged in as admin
    And I navigate to categories view page
    When I enter an invalid category name "NonExistentCategory" in the search field
    And I click the Search button
    Then I should see "No category found" message

  @ui @admin @TC_UI_CAT_ADMIN_05
  Scenario: TC_UI_CAT_ADMIN_05 - Verify parent category filtering
    Given I am logged in as admin
    And I navigate to categories view page
    When I select a parent category from the dropdown
    And I click the Search button
    Then the table should display only categories under selected parent

  @ui @user @TC_UI_CAT_USER_01
  Scenario: TC_UI_CAT_USER_01 - Verify categories page UI elements for User
    Given I am logged in as user
    When I navigate to categories view page
    Then the search input should be visible
    And the "All Parents" dropdown should be visible
    And the Search button should be visible
    And the Reset button should be visible
    And the "Add A Category" button should not be visible
    And edit and delete buttons should not be visible
