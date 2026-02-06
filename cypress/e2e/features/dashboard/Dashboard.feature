Feature: Dashboard Functionality
  As an admin user
  I want to access the dashboard
  So that I can view the main application interface

  Background:
    Given I navigate to the login page

  @smoke @TC_UI_DASHBOARD_ADMIN_01
  Scenario: Verify Dashboard page loads after login
    When I enter username "admin"
    And I enter password "admin123"
    And I click on login button
    Then I should be automatically redirected to the dashboard
    And the dashboard page title "Dashboard" should be displayed
    And the page should load within 3 seconds
    And no errors should occur during navigation

  @TC_UI_DASHBOARD_ADMIN_02
  Scenario: Verify Categories card navigation for admin
    Given I am logged in as admin
    And I should be on the dashboard page
    When I click on the "Manage Categories" button on the dashboard
    Then the URL should contain "/ui/categories"
    And the sidebar should highlight "Categories"

  @TC_UI_DASHBOARD_ADMIN_03
  Scenario: Verify Plants card navigation for admin
    Given I am logged in as admin
    And I should be on the dashboard page
    When I click on the "Manage Plants" button on the dashboard
    Then the URL should contain "/ui/plants"
    And the sidebar should highlight "Plants"

  @TC_UI_DASHBOARD_ADMIN_04
  Scenario: Verify Sales card navigation for admin
    Given I am logged in as admin
    And I should be on the dashboard page
    When I click on the "View Sales" button on the dashboard
    Then the URL should contain "/ui/sales"
    And the sidebar should highlight "Sales"

  @TC_UI_DASHBOARD_ADMIN_05
  Scenario: Verify sidebar navigation is active on dashboard for admin
    Given I am logged in as admin
    And I should be on the dashboard page
    Then the sidebar should highlight "Dashboard"
    And the "Categories" sidebar item should not be active
    And the "Plants" sidebar item should not be active
    And the "Sales" sidebar item should not be active

  @TC_UI_DASHBOARD_USER_01
  Scenario: Verify Dashboard loads for User role
    Given I navigate to the login page
    When I enter username "testuser"
    And I enter password "test123"
    And I click on login button
    Then I should be automatically redirected to the dashboard
    And the dashboard page title "Dashboard" should be displayed
    And the page should load within 3 seconds
    And no errors should occur during navigation

  @TC_UI_DASHBOARD_USER_02
  Scenario: Verify User can navigate to Categories in read-only mode
    Given I am logged in as user
    And I should be on the dashboard page
    When I click on the "Manage Categories" button on the dashboard
    Then the URL should contain "/ui/categories"
    And the "Add" button should not be visible on the page
    And edit and delete icons should be visible
    And existing categories should be visible

  @TC_UI_DASHBOARD_USER_03
  Scenario: Verify User can navigate to Plants in read-only mode
    Given I am logged in as user
    And I should be on the dashboard page
    When I click on the "Manage Plants" button on the dashboard
    Then the URL should contain "/ui/plants"
    And the "Add" button should not be visible on the page
    And edit and delete icons should not be visible

  @TC_UI_DASHBOARD_USER_04
  Scenario: Verify User can navigate to Sales in read-only mode
    Given I am logged in as user
    And I should be on the dashboard page
    When I click on the "View Sales" button on the dashboard
    Then the URL should contain "/ui/sales"
    And the "Sell Plant" button should not be visible on the page
    And delete icons should not be visible

  @TC_UI_DASHBOARD_USER_05
  Scenario: Verify User dashboard sidebar navigation
    Given I am logged in as user
    And I should be on the dashboard page
    Then the sidebar should highlight "Dashboard"
    And the "Categories" sidebar item should not be active
    And the "Plants" sidebar item should not be active
    And the "Sales" sidebar item should not be active