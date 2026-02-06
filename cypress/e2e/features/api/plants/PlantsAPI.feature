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
