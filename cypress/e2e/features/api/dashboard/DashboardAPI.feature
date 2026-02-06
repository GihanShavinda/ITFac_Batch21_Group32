Feature: Dashboard API Functionality
  As an API consumer
  I want to retrieve dashboard data via REST API
  So that I can access categories, plants, and sales information programmatically

  # =============================================
  # ADMIN API TESTS (5 test cases)
  # =============================================

  @api @smoke @TC_API_DASHBOARD_ADMIN_01
  Scenario: Admin retrieves dashboard summary data
    Given I am authenticated as "admin" via API
    When I send a GET request to "/api/categories"
    Then the response status code should be 200
    And the response should contain valid JSON data
    When I send a GET request to "/api/plants"
    Then the response status code should be 200
    And the response should contain valid JSON data
    When I send a GET request to "/api/sales"
    Then the response status code should be 200
    And the response should contain valid JSON data

  @api @TC_API_DASHBOARD_ADMIN_02
  Scenario: Verify Dashboard API requires authentication
    When I send an unauthenticated GET request to "/api/categories"
    Then the response status should be 401
    When I send an unauthenticated GET request to "/api/plants"
    Then the response status should be 401
    When I send an unauthenticated GET request to "/api/sales"
    Then the response status should be 401

  @api @TC_API_DASHBOARD_ADMIN_03
  Scenario: Verify User role can access Dashboard API
    Given I am authenticated as "testuser" via API
    When I send a GET request to "/api/categories"
    Then the response status should be 200
    And the response body should not be empty
    When I send a GET request to "/api/plants"
    Then the response status should be 200
    When I send a GET request to "/api/sales"
    Then the response status should be 200

  @api @TC_API_DASHBOARD_ADMIN_08
  Scenario: Verify Dashboard API data consistency
    Given I am authenticated as admin for API
    When I send a GET request to "/api/categories"
    Then the response status should be 200
    And I store the response body as "firstResponse"
    When I wait 2 seconds
    And I send a GET request to "/api/categories"
    Then the response status should be 200
    And the response body should match the stored "firstResponse"

  @api @TC_API_DASHBOARD_ADMIN_05
  Scenario: Verify Dashboard API returns valid response for data
    Given I am authenticated as admin for API
    When I send a GET request to "/api/categories"
    Then the response status should be 200
    And the response should be a valid JSON
    When I send a GET request to "/api/plants"
    Then the response status should be 200
    And the response should be a valid JSON
    When I send a GET request to "/api/sales"
    Then the response status should be 200
    And the response should be a valid JSON

  # =============================================
  # USER API TESTS (5 test cases)
  # =============================================

  @api @TC_API_DASHBOARD_USER_01
  Scenario: User retrieves dashboard data read-only
    Given I am authenticated as user for API
    When I send a GET request to "/api/categories"
    Then the response status should be 200
    And the response body should not be empty
    When I send a GET request to "/api/plants"
    Then the response status should be 200
    When I send a GET request to "/api/sales"
    Then the response status should be 200

  @api @TC_API_DASHBOARD_USER_02
  Scenario: Verify User dashboard API handles empty data gracefully
    Given I am authenticated as user for API
    When I send a GET request to "/api/categories"
    Then the response status should be 200
    And the response should be a valid JSON
    When I send a GET request to "/api/plants"
    Then the response status should be 200
    And the response should be a valid JSON
    When I send a GET request to "/api/sales"
    Then the response status should be 200
    And the response should be a valid JSON

  @api @TC_API_DASHBOARD_USER_03
  Scenario: Verify User dashboard API data accuracy
    Given I am authenticated as user for API
    When I send a GET request to "/api/categories"
    Then the response status should be 200
    And each category in the response should have "id" and "name"
    When I send a GET request to "/api/plants"
    Then the response status should be 200
    And each plant in the response should have "id" and "name" and "price" and "quantity"
    When I send a GET request to "/api/sales"
    Then the response status should be 200
    And each sale in the response should have "id" and "quantity" and "totalPrice"

  @api @TC_API_DASHBOARD_USER_04
  Scenario: Verify User dashboard API data consistency
    Given I am authenticated as user for API
    When I send a GET request to "/api/categories"
    Then the response status should be 200
    And I store the response body as "firstUserResponse"
    When I wait 2 seconds
    And I send a GET request to "/api/categories"
    Then the response status should be 200
    And the response body should match the stored "firstUserResponse"

  @api @TC_API_DASHBOARD_USER_05
  Scenario: Verify User and Admin receive same dashboard data
    Given I am authenticated as user for API
    When I send a GET request to "/api/categories"
    Then the response status should be 200
    And I store the response body as "userCategoriesData"
    Given I am authenticated as admin for API
    When I send a GET request to "/api/categories"
    Then the response status should be 200
    And the response body should match the stored "userCategoriesData"
