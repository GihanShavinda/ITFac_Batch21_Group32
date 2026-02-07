Feature: Categories Management
  Verifies category list and add-category flows for admin.

  Background:
    Given I am logged in as admin
    And I navigate to categories page

  @smoke
  Scenario: View all categories
    Then I should see list of categories

  # TC-UI-CAT-ADMIN-01: Add Main Category with Valid Data
  # Preconditions: Admin logged in
  # Expected: Category created successfully, redirects to /ui/categories, new category appears in list
  @smoke @TC_UI_CAT_ADMIN_01
  Scenario: Add main category with valid data
    When I click the Add Category button
    Then I should be on the Add Category page
    When I enter category name "Flowers"
    And I keep it as a Main Category
    And I click Save on the category form
    Then I should be redirected to the category list page
    And I should see the category "Flowers" in the list

  # TC-UI-CAT-ADMIN-02: Add Sub-Category with Valid Data
  # Preconditions: Admin logged in, at least one main category exists
  # Expected: Sub-category created successfully, appears under selected parent in list
  @smoke @TC_UI_CAT_ADMIN_02
  Scenario: Add sub-category with valid data
    Given at least one main category exists
    When I click the Add Category button
    Then I should be on the Add Category page
    When I enter category name "Roses"
    And I select the first parent category
    And I click Save on the category form
    Then I should be redirected to the category list page
    And I should see the category "Roses" in the list

  # TC-UI-CAT-ADMIN-03: Add Category with Minimum Length (3 characters)
  # Preconditions: Admin logged in
  # Expected: Category created successfully
  @smoke @TC_UI_CAT_ADMIN_03
  Scenario: Add category with minimum length
    When I click the Add Category button
    Then I should be on the Add Category page
    When I enter category name "Abc"
    And I keep it as a Main Category
    And I click Save on the category form
    Then I should be redirected to the category list page
    And I should see the category "Abc" in the list

  # TC-UI-CAT-ADMIN-04: Add Category with Maximum Length (10 characters)
  # Preconditions: Admin logged in
  # Expected: Category created successfully
  @smoke @TC_UI_CAT_ADMIN_04
  Scenario: Add category with maximum length
    When I click the Add Category button
    Then I should be on the Add Category page
    When I enter category name "Abcdefghij"
    And I keep it as a Main Category
    And I click Save on the category form
    Then I should be redirected to the category list page
    And I should see the category "Abcdefghij" in the list

  # TC-UI-CAT-ADMIN-05: Add Duplicate Category Name
  # Preconditions: Admin logged in, category "Flowers" exists
  # Expected: Error message indicating duplicate name or category created (check actual behavior)
  @TC_UI_CAT_ADMIN_05
  Scenario: Add duplicate category name
    Given a category "TestDupe" already exists
    When I click the Add Category button
    Then I should be on the Add Category page
    When I enter exact category name "TestDupe"
    And I keep it as a Main Category
    And I click Save on the category form
    Then I should see an error message about duplicate category

  # TC-UI-CAT-ADMIN-06: Convert Sub-Category to Main Category
  # Preconditions: Admin logged in, sub-category exists
  # Expected: Category becomes main category with no parent
  @TC_UI_CAT_ADMIN_06
  Scenario: Convert sub-category to main category
    Given a sub-category exists for editing
    When I navigate to edit that sub-category
    Then I should be on the Edit Category page
    When I change parent to Main Category
    And I click Save on the category form
    Then I should be redirected to the category list page
    And the category should be a main category

  # TC-UI-CAT-ADMIN-07: Edit Category Name Successfully
  # Preconditions: Admin logged in, category exists
  # Expected: Category updated, redirects to list, shows updated name
  @TC_UI_CAT_ADMIN_07
  Scenario: Edit category name successfully
    Given a category exists for editing
    When I navigate to edit that category
    Then I should be on the Edit Category page
    When I update category name to "UpdatedName"
    And I click Save on the category form
    Then I should be redirected to the category list page
    And I should see the category "UpdatedName" in the list

  # TC-UI-CAT-ADMIN-08: Edit Category with Empty Name
  # Preconditions: Admin logged in, category exists
  # Expected: Error "Category name is required" displayed
  @TC_UI_CAT_ADMIN_08
  Scenario: Edit category with empty name
    Given a category exists for editing
    When I navigate to edit that category
    Then I should be on the Edit Category page
    When I clear the category name field
    And I click Save on the category form
    Then I should see a validation error about required name

  # TC-UI-CAT-ADMIN-09: Edit Category Name Above Maximum Length
  # Preconditions: Admin logged in, category exists
  # Expected: Error "Category name must be between 3 and 10 characters"
  @TC_UI_CAT_ADMIN_09
  Scenario: Edit category name above maximum length
    Given a category exists for editing
    When I navigate to edit that category
    Then I should be on the Edit Category page
    When I update category name to "Abcdefghijk"
    And I click Save on the category form
    Then I should see a validation error about name length

  # TC-UI-CAT-ADMIN-10: Delete Main Category Successfully
  # Preconditions: Admin logged in, main category exists with no sub-categories
  # Expected: Category deleted, no longer appears in list
  @TC_UI_CAT_ADMIN_10
  Scenario: Delete main category successfully
    Given a deletable main category exists
    When I navigate to categories page
    And I delete the test category
    Then the category should not appear in the list

  # TC-UI-CAT-ADMIN-11: Delete Sub-Category Successfully
  # Preconditions: Admin logged in, sub-category exists
  # Expected: Sub-category deleted, removed from list
  @TC_UI_CAT_ADMIN_11
  Scenario: Delete sub-category successfully
    Given a deletable sub-category exists
    When I navigate to categories page
    And I delete the test category
    Then the category should not appear in the list

  # TC-UI-CAT-ADMIN-12: Delete Main Category with Sub-Categories
  # Preconditions: Admin logged in, main category has sub-categories
  # Expected: Error or cascading delete (check actual behavior)
  @TC_UI_CAT_ADMIN_12
  Scenario: Delete main category with sub-categories
    Given a main category with sub-categories exists
    When I navigate to categories page
    And I attempt to delete the parent category
    Then I should see an error or cascading delete occurs

  # TC-UI-CAT-ADMIN-13: Add Category with Empty Name
  # Preconditions: Admin logged in
  # Expected: Error message "Category name is required" displayed
  @TC_UI_CAT_ADMIN_13
  Scenario: Add category with empty name
    When I click the Add Category button
    Then I should be on the Add Category page
    When I keep it as a Main Category
    And I click Save on the category form
    Then I should see a validation error about required name

  # TC-UI-CAT-ADMIN-14: Cancel Add Category Operation
  # Preconditions: Admin logged in
  # Expected: Returns to /ui/categories, no new category added
  @TC_UI_CAT_ADMIN_14
  Scenario: Cancel add category operation
    When I click the Add Category button
    Then I should be on the Add Category page
    When I enter category name "TestCat"
    And I keep it as a Main Category
    And I click Cancel on the category form
    Then I should be redirected to the category list page

  # TC-UI-CAT-ADMIN-15: Add Category with Name Less Than 3 Characters
  # Preconditions: Admin logged in
  # Expected: Error "Category name must be between 3 and 10 characters"
  @TC_UI_CAT_ADMIN_15
  Scenario: Add category with name less than 3 characters
    When I click the Add Category button
    Then I should be on the Add Category page
    When I enter exact category name "Ab"
    And I keep it as a Main Category
    And I click Save on the category form
    Then I should see a validation error about name length

  # TC-UI-CAT-ADMIN-16: Add Category with Name More Than 10 Characters
  # Preconditions: Admin logged in
  # Expected: Error "Category name must be between 3 and 10 characters"
  @TC_UI_CAT_ADMIN_16
  Scenario: Add category with name more than 10 characters
    When I click the Add Category button
    Then I should be on the Add Category page
    When I enter exact category name "Abcdefghijk"
    And I keep it as a Main Category
    And I click Save on the category form
    Then I should see a validation error about name length

  # TC-UI-CAT-ADMIN-17: Convert Main Category to Sub-Category
  # Preconditions: Admin logged in, main category exists
  # Expected: Category becomes sub-category under selected parent
  @TC_UI_CAT_ADMIN_17
  Scenario: Convert main category to sub-category
    Given a main category exists for conversion
    And another main category exists as parent
    When I navigate to edit the conversion category
    Then I should be on the Edit Category page
    When I change parent to the available parent category
    And I click Save on the category form
    Then I should be redirected to the category list page
    And the category should be a sub-category

  # TC-UI-CAT-ADMIN-18: Edit Category Parent Successfully
  # Preconditions: Admin logged in, sub-category and multiple main categories exist
  # Expected: Category updated with new parent relationship
  @TC_UI_CAT_ADMIN_18
  Scenario: Edit category parent successfully
    Given a sub-category with a parent exists
    And another main category exists as alternate parent
    When I navigate to edit the sub-category
    Then I should be on the Edit Category page
    When I change parent to the alternate parent category
    And I click Save on the category form
    Then I should be redirected to the category list page
    And the category should have the new parent

  # TC-UI-CAT-ADMIN-19: Edit Category Name Below Minimum Length
  # Preconditions: Admin logged in, category exists
  # Expected: Error "Category name must be between 3 and 10 characters"
  @TC_UI_CAT_ADMIN_19
  Scenario: Edit category name below minimum length
    Given a category exists for editing
    When I navigate to edit that category
    Then I should be on the Edit Category page
    When I update category name to "Ab"
    And I click Save on the category form
    Then I should see a validation error about name length
