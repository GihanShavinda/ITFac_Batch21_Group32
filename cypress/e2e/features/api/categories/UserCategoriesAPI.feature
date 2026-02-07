Feature: User Categories API - Security Tests
  Verifies that non-admin users cannot perform category operations via API.

  # TC-API-CAT-USER-01: User Create Category 
  # Test Summary: Verify user cannot create category via API
  # Precondition: User is authenticated
  # Expected: Returns 403 Forbidden with "User is not permitted"
  @api @user @negative @security @TC_API_CAT_USER_01
  Scenario: User cannot create category via API
    Given I am authenticated as user for API
    When I send a POST request to create a category as user with name "Flowers" and parentId null
    Then the response status should be 403
    And the response body should contain error message "User is not permitted"

  # TC-API-CAT-USER-02: User Update Category 
  # Test Summary: Verify user cannot update category via API
  # Precondition: User is authenticated, category exists
  # Expected: Returns 403 Forbidden
  @api @user @negative @security @TC_API_CAT_USER_02
  Scenario: User cannot update category via API
    Given I am authenticated as user for API
    And a category exists with id 1
    When I send a PUT request to update category with id 1 and name "Updated Name"
    Then the response status should be 403
    And the response body should contain error message "User is not permitted"

  # TC-API-CAT-USER-03: User Delete Category
  # Test Summary: Verify user cannot delete category via API
  # Precondition: User is authenticated, category exists
  # Expected: Returns 403 Forbidden
  @api @user @negative @security @TC_API_CAT_USER_03
  Scenario: User cannot delete category via API
    Given I am authenticated as user for API
    And a category exists with id 1
    When I send a DELETE request to delete category with id 1
    Then the response status should be 403
    And the response body should contain error message "User is not permitted"

  # TC-API-CAT-USER-04: User Create Category with Valid Data
  # Test Summary: Verify user cannot create category via API even with valid request body
  # Precondition: User is authenticated
  # Expected: Returns 403 Forbidden
  @api @user @negative @security @TC_API_CAT_USER_04
  Scenario: User cannot create category with valid data via API
    Given I am authenticated as user for API
    When I send a POST request to create a category as user with name "Fruits" and parentId null
    Then the response status should be 403
    And the response body should contain error message "forbidden"

  # TC-API-CAT-USER-05: User Update Category with Valid Data 
  # Test Summary: Verify user cannot update existing category via API with valid data
  # Precondition: User is authenticated, valid category exists
  # Expected: Returns 403 Forbidden
  @api @user @negative @security @TC_API_CAT_USER_05
  Scenario: User cannot update category with valid data via API
    Given I am authenticated as user for API
    And a category exists with id 1
    When I send a PUT request to update category with id 1 and name "Trees"
    Then the response status should be 403
    And the response body should contain error message "forbidden"
