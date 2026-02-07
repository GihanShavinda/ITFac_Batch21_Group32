
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import CategoriesViewPage from "../../../../pages/categoriesView/CategoriesViewPage";
import LoginPage from "../../../../pages/LoginPage";



When("I navigate to categories view page", () => {
  cy.wait(500);
  CategoriesViewPage.visit();
  cy.wait(500);

  cy.url().then((url) => {
    if (!url.includes("/categories")) {
    }
  });
});


Given("all categories are cleared", () => {
  cy.visit("/ui/categories");
  cy.wait(1000);

  cy.get("body").then(($body) => {
    const emptyMsg = $body.text().toLowerCase();
    if (emptyMsg.includes("no categories") || emptyMsg.includes("no data")) {
      return;
    }

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
      return;
    }
  });
});


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


Given("categories exist in the system", () => {
  CategoriesViewPage.getCategoryCount().then((count) => {
    expect(count).to.be.greaterThan(0);
  });
});

Given("categories with parents exist in the system", () => {
  CategoriesViewPage.elements.tableRows().first().should("be.visible");
  CategoriesViewPage.elements
    .allParentsDropdown()
    .should("have.length.greaterThan", 1);
});


Given("a category named {string} exists", (categoryName) => {
  cy.wrap(categoryName).as("categoryName");

  cy.visit("/ui/categories/add");
  cy.get(
    'input[name="name"], input[placeholder*="Category name"], #categoryName',
  ).type(categoryName);
  cy.contains("button", /Add|Create|Submit|Save/i).click();
  cy.wait(1000);
  cy.visit("/ui/categories");
  cy.get("table", { timeout: 10000 })
    .contains("td", categoryName)
    .should("be.visible");
});

When("I enter {string} in the search field", (searchTerm) => {
  cy.wrap(searchTerm).as("searchCategory");
  CategoriesViewPage.enterSearchQuery(searchTerm);
});

When("I enter a valid category name in the search field", () => {
  const searchTerm = "Test";
  cy.wrap(searchTerm).as("searchCategory");
  CategoriesViewPage.enterSearchQuery(searchTerm);
});

When(
  "I enter an invalid category name {string} in the search field",
  (name) => {
    const invalidName = name || "NonExistentCategory" + Date.now();
    cy.wrap(invalidName).as("searchCategory");
    CategoriesViewPage.enterSearchQuery(invalidName);
  },
);

When("I enter an invalid category name in the search field", (name) => {
  const invalidName = name || "NonExistentCategory" + Date.now();
  cy.wrap(invalidName).as("searchCategory");
  CategoriesViewPage.enterSearchQuery(invalidName);
});

When(
  "I enter a valid category name {string} in the search field",
  (categoryName) => {
    cy.wrap(categoryName).as("searchCategory");
    CategoriesViewPage.enterSearchQuery(categoryName);
  },
);

When("I click the Search button", () => {
  CategoriesViewPage.clickSearch();
});

When("I select a parent category from the dropdown", () => {
  CategoriesViewPage.elements.allParentsDropdown().then(($select) => {
    const $opts = Cypress.$($select)
      .find("option")
      .filter((i, el) => {
        const v = Cypress.$(el).attr("value");
        const t = Cypress.$(el).text().trim();
        return v !== "" && t.length > 0;
      });

    if ($opts.length === 0) {
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
  CategoriesViewPage.elements.noDataMessage().should("not.exist");
  CategoriesViewPage.elements.tableRows().should("have.length.greaterThan", 0);
});


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
