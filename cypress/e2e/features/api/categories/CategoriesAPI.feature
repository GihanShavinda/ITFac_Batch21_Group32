Feature: Categories API
  Verifies category creation and other API operations as admin.

  # TC-API-CAT-ADMIN-01: Create Category via API (Admin)
  # Preconditions: Admin authenticated.
  # Expected: 201 Created with category details in response body.
  @api @TC_API_CAT_ADMIN_01
  Scenario: Create category via API as admin
    Given I am authenticated as admin for API
    When I send a POST request to create a category with name "Flowers" and parentId null
    Then the response status should be 201
    And the response body should contain category details

  # TC-API-CAT-ADMIN-02: Create Sub-Category via API
  # Preconditions: Admin authenticated; parent category exists.
  # Expected: 201 Created with sub-category details in response body.
  @api @TC_API_CAT_ADMIN_02
  Scenario: Create sub-category via API as admin
    Given I am authenticated as admin for API
    When I send a POST request to create a category with name "Roses" and parentId 1
    Then the response status should be 201
    And the response body should contain category details

  # TC-API-CAT-ADMIN-03: API Validation - Empty Name
  # Preconditions: Admin authenticated.
  # Expected: 400 Bad Request with validation error message.
  @api @TC_API_CAT_ADMIN_03 @negative
  Scenario: Verify API validates empty category name
    Given I am authenticated as admin for API
    When I send a POST request to create a category with name "" and parentId null
    Then the response status should be 400
    And the response body should contain error message "Category name is required"

  # TC-API-CAT-ADMIN-04: API Validation - Name Too Long
  # Preconditions: Admin authenticated.
  # Expected: 400 Bad Request with length validation error.
  @api @TC_API_CAT_ADMIN_04 @negative
  Scenario: Verify API validates maximum category name length
    Given I am authenticated as admin for API
    When I send a POST request to create a category with name "Abcdefghijk" and parentId null
    Then the response status should be 400
    And the response body should contain error message "name"

  # TC-API-CAT-ADMIN-05: API Validation - Name Too Short
  # Preconditions: Admin authenticated.
  # Expected: 400 Bad Request with minimum length validation error.
  @api @TC_API_CAT_ADMIN_05 @negative
  Scenario: Verify API validates minimum category name length
    Given I am authenticated as admin for API
    When I send a POST request to create a category with name "Ab" and parentId null
    Then the response status should be 400
    And the response body should contain error message "Category name must be between 3 and 10 characters"
