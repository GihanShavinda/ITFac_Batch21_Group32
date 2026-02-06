# cypress/e2e/features/api/sales/SalesAPI.feature
Feature: Sales API

  # ===== ADMIN API TESTS (5 tests) =====

  @api @TC_API_SALES_ADMIN_01
  Scenario: TC_API_SALES_ADMIN_01 - GET all sales returns correct data
    Given I am authenticated as admin for API
    When I send GET request to "/api/sales/page"
    Then the response status should be 200
    And the response should contain array of sales
    And each sale should have required fields

  @api @TC_API_SALES_ADMIN_02
  Scenario: TC_API_SALES_ADMIN_02 - GET sales returns empty array
    Given I am authenticated as admin for API
    And no sales exist in database
    When I send GET request to "/api/sales/page"
    Then the response status should be 200
    And the response should be empty array

  @api @TC_API_SALES_ADMIN_03
  Scenario: TC_API_SALES_ADMIN_03 - GET plants returns available stock
    Given I am authenticated as admin for API
    When I send GET request to "/api/plants"
    Then the response status should be 200
    And only plants with stock should be returned

  @api @TC_API_SALES_ADMIN_04
  Scenario: TC_API_SALES_ADMIN_04 - DELETE sale restores stock
    Given I am authenticated as admin for API
    And a test sale exists
    When I send DELETE request for the sale
    Then the response status should be 204
    And the plant stock should be restored

  @api @TC_API_SALES_ADMIN_05
  Scenario: TC_API_SALES_ADMIN_05 - Verify User cannot delete sale
    Given I am authenticated as user for API
    And a test sale exists
    When I send DELETE request for the sale
    Then the response status should be 403
    And the sale should not be deleted

  # ===== USER API TESTS (5 tests) =====

  @api @TC_API_SALES_USER_01
  Scenario: TC_API_SALES_USER_01 - User can GET sales
    Given I am authenticated as user for API
    When I send GET request to "/api/sales/page"
    Then the response status should be 200
    And the response should contain array of sales

  @api @TC_API_SALES_USER_02
  Scenario: TC_API_SALES_USER_02 - User cannot delete via API
    Given I am authenticated as user for API
    And a test sale exists
    When I send DELETE request for the sale
    Then the response status should be 403

  @api @TC_API_SALES_USER_03
  Scenario: TC_API_SALES_USER_03 - User cannot create via API
    Given I am authenticated as user for API
    When I send POST request to create sale
    Then the response status should be 403

  @api @TC_API_SALES_USER_04
  Scenario: TC_API_SALES_USER_04 - Unauthorized access returns 401
    Given I am not authenticated
    When I send GET request to "/api/sales/page"
    Then the response status should be 401

  @api @TC_API_SALES_USER_05
  Scenario: TC_API_SALES_USER_05 - Verify unauthorized handling
    Given I am not authenticated
    When I send GET request to "/api/sales"
    Then the response status should be 401