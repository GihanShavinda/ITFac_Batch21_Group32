Feature: Categories Management
  Verifies category list and add-category flows for admin.

  Background:
    Given I am logged in as admin
    And I navigate to categories page

  @smoke
  Scenario: View all categories
    Then I should see list of categories

  # TST-CAT-001: Add Main Category with Valid Data
  # Preconditions: Admin logged in
  # Expected: Category created successfully, redirects to /ui/categories, new category appears in list
  @smoke @TST_CAT_001
  Scenario: Add main category with valid data
    When I click the Add Category button
    Then I should be on the Add Category page
    When I enter category name "Flowers"
    And I keep it as a Main Category
    And I click Save on the category form
    Then I should be redirected to the category list page
    And I should see the category "Flowers" in the list

  # TST-CAT-002: Add Sub-Category with Valid Data
  # Preconditions: Admin logged in, at least one main category exists
  # Expected: Sub-category created successfully, appears under selected parent in list
  @smoke @TST_CAT_002
  Scenario: Add sub-category with valid data
    Given at least one main category exists
    When I click the Add Category button
    Then I should be on the Add Category page
    When I enter category name "Roses"
    And I select the first parent category
    And I click Save on the category form
    Then I should be redirected to the category list page
    And I should see the category "Roses" in the list

  # TST-CAT-003: Add Category with Minimum Length (3 characters)
  # Preconditions: Admin logged in
  # Expected: Category created successfully
  @smoke @TST_CAT_003
  Scenario: Add category with minimum length
    When I click the Add Category button
    Then I should be on the Add Category page
    When I enter category name "Abc"
    And I keep it as a Main Category
    And I click Save on the category form
    Then I should be redirected to the category list page
    And I should see the category "Abc" in the list

  # TST-CAT-004: Add Category with Maximum Length (10 characters)
  # Preconditions: Admin logged in
  # Expected: Category created successfully
  @smoke @TST_CAT_004
  Scenario: Add category with maximum length
    When I click the Add Category button
    Then I should be on the Add Category page
    When I enter category name "Abcdefghij"
    And I keep it as a Main Category
    And I click Save on the category form
    Then I should be redirected to the category list page
    And I should see the category "Abcdefghij" in the list

  # TST-CAT-005: Add Duplicate Category Name
  # Preconditions: Admin logged in, category "Flowers" exists
  # Expected: Error message indicating duplicate name or category created (check actual behavior)
  @TST_CAT_005
  Scenario: Add duplicate category name
    Given a category "TestDupe" already exists
    When I click the Add Category button
    Then I should be on the Add Category page
    When I enter exact category name "TestDupe"
    And I keep it as a Main Category
    And I click Save on the category form
    Then I should see an error message about duplicate category

  # TST-CAT-006: Convert Sub-Category to Main Category
  # Preconditions: Admin logged in, sub-category exists
  # Expected: Category becomes main category with no parent
  @TST_CAT_006
  Scenario: Convert sub-category to main category
    Given a sub-category exists for editing
    When I navigate to edit that sub-category
    Then I should be on the Edit Category page
    When I change parent to Main Category
    And I click Save on the category form
    Then I should be redirected to the category list page
    And the category should be a main category

  # TST-CAT-007: Edit Category Name Successfully
  # Preconditions: Admin logged in, category exists
  # Expected: Category updated, redirects to list, shows updated name
  @TST_CAT_007
  Scenario: Edit category name successfully
    Given a category exists for editing
    When I navigate to edit that category
    Then I should be on the Edit Category page
    When I update category name to "UpdatedName"
    And I click Save on the category form
    Then I should be redirected to the category list page
    And I should see the category "UpdatedName" in the list

  # TST-CAT-008: Edit Category with Empty Name
  # Preconditions: Admin logged in, category exists
  # Expected: Error "Category name is required" displayed
  @TST_CAT_008
  Scenario: Edit category with empty name
    Given a category exists for editing
    When I navigate to edit that category
    Then I should be on the Edit Category page
    When I clear the category name field
    And I click Save on the category form
    Then I should see a validation error about required name

  # TST-CAT-009: Edit Category Name Above Maximum Length
  # Preconditions: Admin logged in, category exists
  # Expected: Error "Category name must be between 3 and 10 characters"
  @TST_CAT_009
  Scenario: Edit category name above maximum length
    Given a category exists for editing
    When I navigate to edit that category
    Then I should be on the Edit Category page
    When I update category name to "Abcdefghijk"
    And I click Save on the category form
    Then I should see a validation error about name length

  # TST-CAT-010: Delete Main Category Successfully
  # Preconditions: Admin logged in, main category exists with no sub-categories
  # Expected: Category deleted, no longer appears in list
  @TST_CAT_010
  Scenario: Delete main category successfully
    Given a deletable main category exists
    When I navigate to categories page
    And I delete the test category
    Then the category should not appear in the list

  # TST-CAT-011: Delete Sub-Category Successfully
  # Preconditions: Admin logged in, sub-category exists
  # Expected: Sub-category deleted, removed from list
  @TST_CAT_011
  Scenario: Delete sub-category successfully
    Given a deletable sub-category exists
    When I navigate to categories page
    And I delete the test category
    Then the category should not appear in the list

  # TST-CAT-012: Delete Main Category with Sub-Categories
  # Preconditions: Admin logged in, main category has sub-categories
  # Expected: Error or cascading delete (check actual behavior)
  @TST_CAT_012
  Scenario: Delete main category with sub-categories
    Given a main category with sub-categories exists
    When I navigate to categories page
    And I attempt to delete the parent category
    Then I should see an error or cascading delete occurs


