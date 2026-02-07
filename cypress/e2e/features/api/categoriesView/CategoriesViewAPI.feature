Feature: Categories View API
	Verifies category viewing via API for admin role.

	@api @smoke @TC_API_CAT_ADMIN_01
	Scenario: TC_API_CAT_ADMIN_01 - Get all categories
		Given I am authenticated as "admin" via API
		When I send a GET request to "/api/categories"
		Then the response status code should be 200
		And the response should contain valid JSON data
		And the response should contain a list of categories with id, name, parent, and subCategories

	@api @TC_API_CAT_ADMIN_02
	Scenario: TC_API_CAT_ADMIN_02 - Get category by valid ID
		Given I am authenticated as "admin" via API
		And a valid category with ID "19" exists
		When I send a GET request to "/api/categories/19"
		Then the response status code should be 200
		And the response should contain category object with correct data

	@api @TC_API_CAT_ADMIN_03
	Scenario: TC_API_CAT_ADMIN_03 - Get category by invalid ID
		Given I am authenticated as "admin" via API
		When I send a GET request to "/api/categories/99999"
		Then the response status code should be 404
		And the response should contain an error message

	@api @TC_API_CAT_ADMIN_04
	Scenario: TC_API_CAT_ADMIN_04 - Get category summary
		Given I am authenticated as "admin" via API
		When I send a GET request to "/api/categories/summary"
		Then the response status code should be 200
		And the response should contain summary data
	@api @TC_API_CAT_ADMIN_05
	Scenario: TC_API_CAT_ADMIN_05 - Get sub categories
		Given I am authenticated as "admin" via API
		When I send a GET request to "/api/categories/sub-categories"
		Then the response status code should be 200
		And the response should contain a list of subcategories

	@api @TC_API_CAT_USER_01
	Scenario: TC_API_CAT_USER_01 - Get all categories as User
		Given I am authenticated as "user" via API
		When I send a GET request to "/api/categories"
		Then the response status code should be 200
		And the response should contain a list of categories

	@api @TC_API_CAT_USER_02
	Scenario: TC_API_CAT_USER_02 - Get category by valid ID as User
		Given I am authenticated as "user" via API
		And a valid category with ID "19" exists
		When I send a GET request to "/api/categories/19"
		Then the response status code should be 200
		And the response should contain category object
	@api @TC_API_CAT_USER_03
	Scenario: TC_API_CAT_USER_03 - Get category by invalid ID as User
		Given I am authenticated as "user" via API
		When I send a GET request to "/api/categories/99999"
		Then the response status code should be 404
@api @TC_API_CAT_USER_04
Scenario: TC_API_CAT_USER_04 - Get main categories as User
Given I am authenticated as "user" via API
When I send a GET request to "/api/categories/main"
Then the response status code should be 200
And the response should contain main category list

@api @TC_API_CAT_USER_05
Scenario: TC_API_CAT_USER_05 - Get category summary as User
Given I am authenticated as "user" via API
When I send a GET request to "/api/categories/summary"
Then the response status code should be 200

@api @TC_API_CAT_USER_06
Scenario: TC_API_CAT_USER_06 - Search categories with valid pagination as User
Given I am authenticated as "user" via API
When I send a GET request to "/api/categories/page?page=0&size=5"
Then the response status code should be 200
And the response should contain pagination information
