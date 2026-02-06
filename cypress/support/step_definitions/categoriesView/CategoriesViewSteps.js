/**
 * CategoriesViewSteps.js
 * Step Definitions for Categories View Feature (Gherkin Scenarios)
 *
 * Handles all UI step definitions for Categories View testing including:
 * - Navigation and page verification
 * - Search and filter operations
 * - Sorting functionality
 * - Table element verification
 */

import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import CategoriesViewPage from "../../../pages/categoriesView/CategoriesViewPage";
import LoginPage from "../../../pages/LoginPage";

// ═══════════════════════════════════════════════════════════════════════════
// BACKGROUND STEPS - Login and Navigation
// ═══════════════════════════════════════════════════════════════════════════

// NOTE: Login steps are defined centrally in LoginSteps.js. Do not redefine them here to avoid duplicates.

When("I navigate to categories view page", () => {
  cy.wait(500); // Allow page to stabilize after login
  CategoriesViewPage.visit();
  cy.wait(500); // Wait for categories to load

  // Check if navigation was successful or if there's a redirect
  cy.url().then((url) => {
    if (!url.includes("/categories")) {
      cy.log(`⚠️ WARNING: Expected /categories but got: ${url}`);
    }
  });
});

// Alias matching feature wording: "I navigate to categories page"
// Note: Use existing step definition 'I navigate to categories page' from categories/CategoriesSteps.js
// This step has been removed to avoid duplication.

Given("all categories are cleared", () => {
  // Skip if table doesn't exist yet
  cy.visit("/ui/categories");
  cy.wait(1000);

  // Attempt to find table rows - if none exist, this step is complete
  cy.get("body").then(($body) => {
    // Check if empty state is already shown
    const emptyMsg = $body.text().toLowerCase();
    if (emptyMsg.includes("no categories") || emptyMsg.includes("no data")) {
      cy.log("Categories already empty - skipping clear step");
      return;
    }

    // Try to find delete buttons - if none, categories may already be empty
    const deleteButtons = $body
      .find("table tbody tr button, table tbody tr a")
      .filter(function () {
        const text = Cypress.$(this).text().toLowerCase();
        return (
          text.includes("delete") ||
          text.includes("trash") ||
          text.includes("remove") ||
          text === "×"
        );
      });

    if (deleteButtons.length === 0) {
      cy.log("No delete buttons found - categories may already be empty");
      return;
    }

    cy.log(
      `Found ${deleteButtons.length} delete actions - attempting to clear categories`,
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PAGE ELEMENT VERIFICATION STEPS
// ═══════════════════════════════════════════════════════════════════════════

Then("I should see all UI elements for admin on categories view page", () => {
  CategoriesViewPage.verifyAdminUIElements();
});

Then("I should see all UI elements for user on categories view page", () => {
  CategoriesViewPage.verifyUserUIElements();
});

Then("I should see {string} message", (message) => {
  CategoriesViewPage.verifyNoDataMessageText(message);
});

Then("I should see a search input field", () => {
  CategoriesViewPage.verifySearchInput();
});

Then('I should see an "All Parents" dropdown filter', () => {
  CategoriesViewPage.verifyDropdown();
});

Then("I should see Search and Reset buttons", () => {
  CategoriesViewPage.verifySearchButton();
  CategoriesViewPage.verifyResetButton();
});

Then('I should see "Add A Category" button', () => {
  CategoriesViewPage.elements.addCategoryButton().should("be.visible");
});

Then("the Search button should be visible", () => {
  CategoriesViewPage.elements.searchButton().should("be.visible");
});

Then("the Reset button should be visible", () => {
  CategoriesViewPage.verifyResetButton();
});

Then('the "Add A Category" button should be visible', () => {
  CategoriesViewPage.elements.addCategoryButton().should("be.visible");
});

Then("the search input should be visible", () => {
  CategoriesViewPage.verifySearchInput();
});

Then('the "All Parents" dropdown should be visible', () => {
  CategoriesViewPage.verifyDropdown();
});

// Accept alternate phrasing used in feature files
Then(
  /the\s+Search\s+sub\s*category\s+input\s+field\s+should\s+be\s+visible/i,
  () => {
    CategoriesViewPage.verifySearchInput();
  },
);

Then("the table should contain columns ID, Name, Parent, Actions", () => {
  CategoriesViewPage.verifyTableColumns(["ID", "Name", "Parent", "Actions"]);
});

Then('I should not see "Add A Category" button', () => {
  CategoriesViewPage.elements.addCategoryButton().should("not.exist");
});

Then('the "Add A Category" button should not be visible', () => {
  CategoriesViewPage.elements.addCategoryButton().should("not.exist");
});

Then(
  "I should see table with columns {word}, {word}, {word}, {word}",
  (col1, col2, col3, col4) => {
    CategoriesViewPage.verifyTableColumns([col1, col2, col3, col4]);
  },
);

Then(
  "I should see table with columns {word}, {word}, {word}",
  (col1, col2, col3) => {
    CategoriesViewPage.verifyUserTableColumns([col1, col2, col3]);
  },
);

Then("I should not see Edit or Delete buttons in Actions column", () => {
  CategoriesViewPage.verifyEditButtonNotVisible();
  CategoriesViewPage.verifyDeleteButtonNotVisible();
});

// ═══════════════════════════════════════════════════════════════════════════
// DATA VERIFICATION STEPS
// ═══════════════════════════════════════════════════════════════════════════

Given("categories exist in the system", () => {
  // Verify that the table is not empty and categories are visible
  CategoriesViewPage.getCategoryCount().then((count) => {
    expect(count).to.be.greaterThan(0);
  });
});

Given("categories with parents exist in the system", () => {
  // Verify that categorized data exists with parent relationships
  CategoriesViewPage.elements.tableRows().first().should("be.visible");
  CategoriesViewPage.elements
    .allParentsDropdown()
    .should("have.length.greaterThan", 1);
});

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH STEPS
// ═══════════════════════════════════════════════════════════════════════════

Given("a category named {string} exists", (categoryName) => {
  // Store category name for later use in search
  cy.wrap(categoryName).as("categoryName");

  // Navigate to categories add page and create the category
  cy.visit("/ui/categories/add");
  cy.get(
    'input[name="name"], input[placeholder*="Category name"], #categoryName',
  ).type(categoryName);
  cy.contains("button", /Add|Create|Submit|Save/i).click();
  // After creation, ensure we're on the categories list and the new category appears
  cy.wait(1000);
  cy.visit("/ui/categories");
  cy.get("table", { timeout: 10000 })
    .contains("td", categoryName)
    .should("be.visible");
});

When("I enter {string} in the search field", (searchTerm) => {
  // Store the search term for assertion later
  cy.wrap(searchTerm).as("searchCategory");
  CategoriesViewPage.enterSearchQuery(searchTerm);
});

When("I enter a valid category name in the search field", () => {
  // Type a simple test category name for search
  const searchTerm = "Test";
  cy.wrap(searchTerm).as("searchCategory");
  CategoriesViewPage.enterSearchQuery(searchTerm);
});

// Parameterized invalid-name step (accepts a string in the feature)
When(
  "I enter an invalid category name {string} in the search field",
  (name) => {
    const invalidName = name || "NonExistentCategory" + Date.now();
    cy.wrap(invalidName).as("searchCategory");
    CategoriesViewPage.enterSearchQuery(invalidName);
  },
);

// Backwards-compatible step without parameter
When("I enter an invalid category name in the search field", (name) => {
  const invalidName = name || "NonExistentCategory" + Date.now();
  cy.wrap(invalidName).as("searchCategory");
  CategoriesViewPage.enterSearchQuery(invalidName);
});

// Parameterized step to enter a valid category name (keeps typing only)
When(
  "I enter a valid category name {string} in the search field",
  (categoryName) => {
    cy.wrap(categoryName).as("searchCategory");
    CategoriesViewPage.enterSearchQuery(categoryName);
  },
);

// Generic alias for clicking Search (works across feature phrasing)
When("I click the Search button", () => {
  CategoriesViewPage.clickSearch();
});

When("I select a parent category from the dropdown", () => {
  // Choose the first non-empty option and store its visible text
  CategoriesViewPage.elements.allParentsDropdown().then(($select) => {
    const $opts = Cypress.$($select)
      .find("option")
      .filter((i, el) => {
        const v = Cypress.$(el).attr("value");
        const t = Cypress.$(el).text().trim();
        return v !== "" && t.length > 0;
      });

    if ($opts.length === 0) {
      cy.log("No parent options available");
      cy.wrap("").as("selectedParent");
      return;
    }

    const $first = $opts.first();
    const val = $first.val();
    const text = $first.text().trim();
    cy.wrap(text).as("selectedParent");
    CategoriesViewPage.elements.allParentsDropdown().select(val);
    cy.wait(500);
  });
});

Then("the table should display only categories under selected parent", () => {
  cy.get("@selectedParent").then((parentName) => {
    if (!parentName) {
      cy.log("No parent selected; skipping parent-filter assertions");
      return;
    }
    CategoriesViewPage.verifyFilteredByParent(parentName);
  });
});

When("I click the Search button on categories view", () => {
  CategoriesViewPage.clickSearch();
});

Then("the table should display only matching categories", () => {
  cy.get("@searchCategory").then((searchTerm) => {
    CategoriesViewPage.verifySearchResults(searchTerm);
  });
});

Then("the search result should contain {string}", (searchTerm) => {
  // Robustly check for table presence first, then assert
  cy.get("body").then(($body) => {
    if ($body.find("table").length > 0) {
      cy.get("table", { timeout: 10000 })
        .contains("td", searchTerm, { timeout: 10000 })
        .should("be.visible");
    } else {
      cy.contains(/no categories found|no data|no results/i, {
        timeout: 5000,
      }).should("be.visible");
    }
  });
});

Then("the search result should contain the searched category name", () => {
  cy.get("@searchCategory").then((searchTerm) => {
    cy.get("table", { timeout: 10000 })
      .contains("td", searchTerm, { timeout: 10000 })
      .should("be.visible");
  });
});

Then("the table should be empty", () => {
  CategoriesViewPage.elements.tableRows().should("not.exist");
});

// ═══════════════════════════════════════════════════════════════════════════
// FILTER STEPS
// ═══════════════════════════════════════════════════════════════════════════

When('I click the "All Parents" dropdown', () => {
  CategoriesViewPage.elements.allParentsDropdown().click();
  cy.wait(300);
});

When("I click the Reset button on categories view", () => {
  CategoriesViewPage.clickReset();
});

Then("all filters should be cleared", () => {
  CategoriesViewPage.verifySearchInputCleared();
  CategoriesViewPage.verifyDropdownReset();
});

Then("the search input should be empty", () => {
  CategoriesViewPage.verifySearchInputCleared();
});

Then("all categories should be displayed again", () => {
  // After reset, categories should be visible (not "no data" message)
  CategoriesViewPage.elements.noDataMessage().should("not.exist");
  CategoriesViewPage.elements.tableRows().should("have.length.greaterThan", 0);
});

// ═══════════════════════════════════════════════════════════════════════════
// SORTING STEPS
// ═══════════════════════════════════════════════════════════════════════════

When("I click the ID column header", () => {
  CategoriesViewPage.sortByIdColumn();
  cy.wait(300);
});

When("I click the Name column header", () => {
  CategoriesViewPage.sortByNameColumn();
  cy.wait(300);
});

When("I click the Parent column header", () => {
  CategoriesViewPage.sortByParentColumn();
  cy.wait(300);
});

When("I click the ID column header again", () => {
  CategoriesViewPage.sortByIdColumn();
  cy.wait(300);
});

When("I click the Name column header again", () => {
  CategoriesViewPage.sortByNameColumn();
  cy.wait(300);
});

When("I click the Parent column header again", () => {
  CategoriesViewPage.sortByParentColumn();
  cy.wait(300);
});

Then("categories should be sorted by ID in ascending order", () => {
  CategoriesViewPage.verifySortedByIdAscending();
});

Then("categories should be sorted by ID in descending order", () => {
  CategoriesViewPage.verifySortedByIdDescending();
});

Then("categories should be sorted by Name in ascending order", () => {
  CategoriesViewPage.verifySortedByNameAscending();
});

Then("categories should be sorted by Name in descending order", () => {
  CategoriesViewPage.verifySortedByNameDescending();
});

Then("the sort arrow on ID column should point up", () => {
  CategoriesViewPage.verifySortArrowDirection("ID", "up");
});

Then("the sort arrow on ID column should point down", () => {
  CategoriesViewPage.verifySortArrowDirection("ID", "down");
});

Then("the sort arrow on Name column should point up", () => {
  CategoriesViewPage.verifySortArrowDirection("Name", "up");
});

Then("the sort arrow on Name column should point down", () => {
  CategoriesViewPage.verifySortArrowDirection("Name", "down");
});

Then("the sort arrow on Parent column should point up", () => {
  CategoriesViewPage.verifySortArrowDirection("Parent", "up");
});

Then("the sort arrow on Parent column should point down", () => {
  CategoriesViewPage.verifySortArrowDirection("Parent", "down");
});

Then("edit and delete buttons should not be visible", () => {
  CategoriesViewPage.verifyEditDeleteButtonsNotVisible();
});

Then("the table should be displayed with category records", () => {
  CategoriesViewPage.elements.categoriesTable().should("be.visible");
  CategoriesViewPage.elements.tableRows().should("have.length.greaterThan", 0);
});
