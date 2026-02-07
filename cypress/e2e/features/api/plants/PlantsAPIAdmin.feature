Feature: Plants API
  Verifies plant creation and other API operations as admin.

  # TC_API_PLT_ADMIN_01: Create plant API
  # Preconditions: Admin authenticated; a sub-category exists.
  # Expected: 201 Created with plant details in response body.
  @api @TC_API_PLT_ADMIN_01
  Scenario: Create plant via API as admin
    Given I am authenticated as admin for API
    When I send a POST request to create a plant with name "Rose" price 10 quantity 5 in category 1
    Then the response status should be 201
    And the response body should contain plant details

  # TC_API_PLT_ADMIN_02: Update plant API
  # Preconditions: Admin authenticated; a plant exists with known ID.
  # Expected: 200 OK with updated plant details.
  @api @TC_API_PLT_ADMIN_02
  Scenario: Update plant via API as admin
    Given I am authenticated as admin for API
    And a plant exists for API in category 1
    When I send a PUT request to update the plant with name "Updated Rose" price 15 quantity 8
    Then the response status should be 200
    And the response body should contain plant details
    And the response body should contain the updated plant name and price 15 quantity 8

  # TC_API_PLT_ADMIN_03: Delete plant API
  # Preconditions: Admin authenticated; a plant exists with known ID.
  # Expected: 204 No Content (REST-typical); spec may say 200 OK—align with actual API. GET /api/plants/{id} then returns 404.
  @api @TC_API_PLT_ADMIN_03
  Scenario: Delete plant via API as admin
    Given I am authenticated as admin for API
    And a plant exists for API in category 1
    When I send a DELETE request for that plant
    Then the response status should be 204
    And a GET request to that plant should return status 404

  # TC_API_PLT_ADMIN_04: Validation error (price ≤ 0)
  # Preconditions: Admin authenticated.
  # Expected: 400 Bad Request with error message.
  @api @TC_API_PLT_ADMIN_04
  Scenario: API returns 400 when creating plant with invalid price
    Given I am authenticated as admin for API
    When I send a POST request to create a plant with name "Rose" price 0 quantity 5 in category 1
    Then the response status should be 400
    And the response body should contain the error message "Price must be greater than 0"

  # TC_API_PLT_ADMIN_05: Quantity boundary - quantity 0 allowed
  # Preconditions: Admin authenticated.
  # Expected: 201 Created with plant details.
  @api @TC_API_PLT_ADMIN_05 @TC_API_PLT_ADMIN_05_cleanup
  Scenario: API allows plant creation with quantity 0
    Given I am authenticated as admin for API
    When I send a POST request to create a plant with name "Boundary" price 10 quantity 0 in category 1
    Then the response status should be 201
    And the response body should contain plant details
    And I store the created plant id for cleanup

  # TC_API_PLT_ADMIN_05: Quantity boundary - negative quantity rejected
  # Preconditions: Admin authenticated.
  # Expected: 400 Bad Request with "Quantity cannot be negative".
  @api @TC_API_PLT_ADMIN_05
  Scenario: API returns 400 when creating plant with negative quantity
    Given I am authenticated as admin for API
    When I send a POST request to create a plant with name "InvalidQty" price 10 quantity -1 in category 1
    Then the response status should be 400
    And the response body should contain the error message "Quantity cannot be negative"
