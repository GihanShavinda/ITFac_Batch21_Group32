Feature: User Category Management
  Verifies that non-admin users cannot access category management features.

  # TC-UI-CAT-USER-01: User Attempts to Delete Category
  # Preconditions: User (non-admin) is logged in
  # Expected: Delete action not visible or accessible to user
  @user @ui @negative @security @TC_UI_CAT_USER_01
  Scenario: User Attempts to Delete Category
    Given I am logged in as test user
    When I navigate to categories page
    Then I should not see delete actions for categories

  # TC-UI-CAT-USER-02: User Attempts to Edit Category
  # Preconditions: User (non-admin) is logged in, category exists
  # Expected: Edit action hidden or disabled for normal users
  @user @ui @negative @security @TC_UI_CAT_USER_02
  Scenario: User Attempts to Edit Category
    Given I am logged in as test user
    And a category exists for editing
    When I navigate to categories page
    Then I should not see edit actions for categories

  # TC-UI-CAT-USER-03: User Attempts to Access Add Category Page
  # Preconditions: User (non-admin) is logged in
  # Expected: Redirects to 403 Forbidden page 
  @user @ui @negative @security @TC_UI_CAT_USER_03
  Scenario: User Attempts to Access Add Category Page
    Given I am logged in as test user
    When I attempt to navigate to "/ui/categories/add"
    Then I should see a forbidden or unauthorized page

  # TC-UI-CAT-USER-04: Non-admin user access category edit page via direct URL
  # Preconditions: User (non-admin) is logged in, valid category ID exists
  # Expected: Redirects to 403 Forbidden page
  @user @ui @negative @security @authorization @TC_UI_CAT_USER_04
  Scenario: Non-admin user access category edit page via direct URL
    Given I am logged in as a non-admin user
    And a category with ID "682" exists in the system
    When I navigate directly to "/ui/categories/edit/682"
    Then I should see a forbidden or unauthorized page

  # TC-UI-CAT-USER-05: User Verifies Add Category Button is Hidden
  # Preconditions: User (non-admin) is logged in
  # Expected: "Add Category" button is not visible/hidden, No option to create new category
  @user @ui @negative @security @TC_UI_CAT_USER_05
  Scenario: User Verifies Add Category Button is Hidden
    Given I am logged in as test user
    When I navigate to categories page
    Then I should not see the "Add Category" button
    And I should have no option to create a new category
