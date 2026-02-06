Feature: Plants – User
  Verifies plant list, search, filter, sort, and that admin actions are hidden for users.

  # TC_UI_PLT_USER_01: View plant list (paginated)
  # Preconditions: User logged in; plants may exist.
  # Expected: Paginated list with Name, Price, Quantity; or "No plants found".
  @TC_UI_PLT_USER_01
  Scenario: View plant list as user
    Given I am logged in as user
    And I navigate to plants page
    Then I should see the plant list with pagination or no plants message

  # TC_UI_PLT_USER_02: Search plant by name
  # Preconditions: User logged in; plants exist with searchable names.
  # Expected: Only plants matching the search term are displayed.
  @TC_UI_PLT_USER_02
  Scenario: Search plant by name
    Given I am logged in as user
    And I navigate to plants page
    When I search for plant name "Rose"
    Then only plants matching "Rose" should be displayed

  # TC_UI_PLT_USER_03: Filter by category
  # Preconditions: User logged in; plants exist in different categories.
  # Expected: Only plants in the selected category are displayed.
  @TC_UI_PLT_USER_03
  Scenario: Filter plants by category
    Given I am logged in as user
    And I navigate to plants page
    When I filter by category on the plant list
    Then only plants in the selected category should be displayed

  # TC_UI_PLT_USER_04: Sorting by Name, Price, Stock
  # Preconditions: User logged in; plants exist.
  # Expected: List is sorted correctly by the selected field.
  @TC_UI_PLT_USER_04
  Scenario Outline: Sorting plants by field
    Given I am logged in as user
    And I navigate to plants page
    When I sort the plant list by "<field>"
    Then the plant list should be sorted by "<field>"

    Examples:
      | field |
      | Name  |
      | Price |
      | Stock |

  # TC_UI_PLT_USER_05: Admin actions hidden for user
  # Preconditions: User logged in.
  # Expected: Add Plant button and Edit/Delete actions are not visible.
  @TC_UI_PLT_USER_05
  Scenario: Admin actions are hidden for user
    Given I am logged in as user
    And I navigate to plants page
    Then admin actions (Add Plant, Edit, Delete) should not be visible
