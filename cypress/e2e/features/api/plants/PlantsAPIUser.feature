Feature: Plants API – User
  Verifies plant list, search/filter, and that user cannot create/update/delete plants.

  # TC_API_PLT_USER_01: Get plant list
  # Preconditions: User authenticated.
  # Expected: 200 OK with array of plants.
  @api @TC_API_PLT_USER_01
  Scenario: Get plant list as user
    Given I am authenticated as user for API
    When I send a GET request to list plants
    Then the response status should be 200
    And the response body should contain a list of plants

  # TC_API_PLT_USER_02: Search/filter plants
  # Preconditions: User authenticated; plants exist.
  # Expected: 200 OK with filtered plants.
  @api @TC_API_PLT_USER_02
  Scenario: Search and filter plants as user
    Given I am authenticated as user for API
    When I send a GET request to list plants with name "Rose" and category 1
    Then the response status should be 200
    And the response body should contain a list of plants matching the filters

  # TC_API_PLT_USER_03: Unauthorized create
  # Preconditions: User authenticated.
  # Expected: 403 Forbidden (API returns error: "Forbidden").
  @api @TC_API_PLT_USER_03
  Scenario: User cannot create plant via API
    Given I am authenticated as user for API
    When I send a POST request to create a plant with name "Rose" price 10 quantity 5 in category 1
    Then the response status should be 403
    And the response body should contain the error message "Forbidden"

  # TC_API_PLT_USER_04: Unauthorized update
  # Preconditions: User authenticated; a plant exists (created as admin).
  # Expected: 403 Forbidden (API returns error: "Forbidden").
  @api @TC_API_PLT_USER_04
  Scenario: User cannot update plant via API
    Given I am authenticated as admin for API
    And a plant exists for API in category 1
    And I am authenticated as user for API
    When I send a PUT request to update the plant with name "Updated" price 5 quantity 3
    Then the response status should be 403
    And the response body should contain the error message "Forbidden"

  # TC_API_PLT_USER_05: Unauthorized delete
  # Preconditions: User authenticated; a plant exists (created as admin).
  # Expected: 403 Forbidden (API returns error: "Forbidden").
  @api @TC_API_PLT_USER_05
  Scenario: User cannot delete plant via API
    Given I am authenticated as admin for API
    And a plant exists for API in category 1
    And I am authenticated as user for API
    When I send a DELETE request for that plant
    Then the response status should be 403
    And the response body should contain the error message "Forbidden"
