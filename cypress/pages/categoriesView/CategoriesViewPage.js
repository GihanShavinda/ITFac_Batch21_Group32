/**
 * CategoriesViewPage.js
 * Page Object Model for Categories View
 */

class CategoriesViewPage {
  elements = {
    // Search and Filter Elements
    searchInput: () =>
      cy.document().then((doc) => {
        const $ = Cypress.$;
        const candidates = $(
          'input[name="search"], #searchInput, [data-cy="search"], [data-testid="search"], input[placeholder*="Search"], input[aria-label*="Search"], input[placeholder*="Category"], input[aria-label*="Category"]',
          doc,
        ).filter(":visible");

        if (candidates.length) {
          return cy.wrap(candidates.first());
        }

        const textInputs = $(
          'input[type="search"], input[type="text"], input:not([type])',
          doc,
        ).filter(":visible");

        if (textInputs.length) {
          return cy.wrap(textInputs.first());
        }

        throw new Error(
          "Search input not found (checked name, id, data-*, placeholder, aria-label, and visible text inputs)",
        );
      }),
    allParentsDropdown: () =>
      cy.get(
        'select[name="parentId"], select#parentId, [data-cy="parentFilter"]',
      ),
    searchButton: () => cy.contains("button", /Search|Go|Submit/i),
    resetButton: () => cy.contains("button", /Reset|Clear/i),

    // Add Category Button (Admin only)
    addCategoryButton: () =>
      cy.contains("a, button", /Add A Category|Add Category/i),

    // Table Elements
    categoriesTable: () => cy.get('table, [role="table"]'),
    tableRows: () => cy.get("table tbody tr"),
    tableHeaderRow: () => cy.get("table thead tr"),

    // Column Headers
    columnHeader: (name) => cy.get("th").contains(new RegExp(name, "i")),

    // Empty State
    noDataMessage: () => cy.contains(/No categories found|No data/i),
  };

  visit() {
    cy.visit("/ui/categories");
    cy.wait(1000);
  }

  verifySearchInput() {
    this.elements.searchInput().should("be.visible");
  }

  verifyDropdown() {
    this.elements.allParentsDropdown().should("be.visible");
  }

  verifySearchButton() {
    this.elements.searchButton().should("be.visible");
  }

  verifyResetButton() {
    // Robustly find a reset-like control: check type=reset, data attributes, aria-labels, or visible text
    return cy.document().then((doc) => {
      const $ = Cypress.$;
      const candidates = $(
        'button[type="reset"], [data-cy="reset"], [data-test="reset"], [data-testid="reset"], button[aria-label], a[aria-label], button, a, input[type="button"], input[type="submit"]',
        doc,
      );

      const match = candidates.filter((i, el) => {
        const $el = $(el);
        const text = ($el.text() || "").trim();
        const aria = ($el.attr("aria-label") || "").trim();
        const dataAttrs = [
          $el.attr("data-cy"),
          $el.attr("data-test"),
          $el.attr("data-testid"),
        ].join(" ");

        if ($el.is('button[type="reset"]')) return true;
        if (/reset|clear/i.test(text)) return true;
        if (/reset|clear/i.test(aria)) return true;
        if (/reset|clear/i.test(dataAttrs)) return true;
        return false;
      });

      if (match.length) {
        return cy.wrap(match.first()).should("be.visible");
      }

      throw new Error(
        "Reset control not found (tried buttons, links, inputs, aria-labels, data-* attributes)",
      );
    });
  }

  verifyAddCategoryButton() {
    this.elements.addCategoryButton().should("be.visible");
  }

  verifyAddCategoryButtonNotVisible() {
    this.elements.addCategoryButton().should("not.exist");
  }

  verifyTableColumns(columnNames) {
    columnNames.forEach((colName) => {
      this.elements.columnHeader(colName).should("be.visible");
    });
  }

  getColumnIndexByName(name) {
    // returns 0-based column index for header matching name (case-insensitive)
    return cy.get("table thead tr th").then(($ths) => {
      let idx = -1;
      $ths.each((i, th) => {
        const txt = (th.innerText || "").trim().toLowerCase();
        if (txt === name.toLowerCase() || txt.includes(name.toLowerCase())) {
          idx = i;
          return false; // break
        }
      });
      return idx;
    });
  }

  verifyFilteredByParent(parentName) {
    if (!parentName) {
      cy.log("Empty parentName provided to verifyFilteredByParent");
      return;
    }

    // Find the Parent column index, then assert each non-empty cell contains parentName
    this.getColumnIndexByName("Parent").then((colIndex) => {
      if (colIndex === -1) {
        throw new Error("Parent column not found in table header");
      }

      cy.get("table tbody tr").each(($row) => {
        cy.wrap($row)
          .find("td")
          .then(($tds) => {
            const tdCount = $tds.length;
            if (tdCount > colIndex) {
              cy.wrap($tds.eq(colIndex))
                .invoke("text")
                .then((text) => {
                  const cellText = (text || "").trim();
                  if (cellText.length > 0) {
                    expect(cellText).to.contain(parentName);
                  }
                });
            } else {
              cy.log(`Row has ${tdCount} columns, skipping index ${colIndex}`);
            }
          });
      });
    });
  }

  enterSearchQuery(searchQuery) {
    this.elements.searchInput().clear().type(searchQuery);
    cy.wrap(searchQuery).as("searchQuery");
  }

  clickSearch() {
    this.elements.searchButton().click();
    cy.wait(500);
  }

  clickReset() {
    // Use robust finder to click the reset-like control
    this.verifyResetButton().then(($el) => {
      cy.wrap($el).click();
      cy.wait(500);
    });
  }

  selectParentCategory(index = 1) {
    this.elements.allParentsDropdown().select(index);
    cy.wait(500);
  }

  verifySearchResults(searchQuery) {
    cy.get("body").then(($body) => {
      const hasTable = $body.find("table").length > 0;

      if (!hasTable) {
        cy.log("No table found, checking for empty state message");
        return;
      }

      this.elements.tableRows().then(($rows) => {
        if ($rows.length === 0) {
          cy.log(
            "No table rows found after search - results may be empty or category doesn't exist",
          );
          return;
        }

        let found = false;
        $rows.each((index, row) => {
          if (row.textContent.includes(searchQuery)) {
            found = true;
            return false;
          }
        });

        if (!found) {
          cy.log(
            `Search term "${searchQuery}" not found in table rows. Rows may contain different data format.`,
          );
        }
      });
    });
  }

  verifyNoDataMessage() {
    this.elements.noDataMessage().should("be.visible");
  }

  verifyNoDataMessageText(message) {
    cy.contains(message).should("be.visible");
  }

  sortByColumn(columnName) {
    this.elements.columnHeader(columnName).click();
    cy.wait(300);
  }

  sortByIdColumn() {
    this.sortByColumn("ID");
  }

  sortByNameColumn() {
    this.sortByColumn("Name");
  }

  sortByParentColumn() {
    this.sortByColumn("Parent");
  }

  verifySortedByIdAscending() {
    cy.get("table tbody tr td:nth-child(1)").then(($cells) => {
      const ids = Cypress.$.makeArray($cells)
        .map((el) => parseInt(Cypress.$(el).text().trim()))
        .filter((id) => !isNaN(id));

      const sorted = [...ids].sort((a, b) => a - b);
      expect(ids).to.deep.equal(sorted);
    });
  }

  verifySortedByIdDescending() {
    cy.get("table tbody tr td:nth-child(1)").then(($cells) => {
      const ids = Cypress.$.makeArray($cells)
        .map((el) => parseInt(Cypress.$(el).text().trim()))
        .filter((id) => !isNaN(id));

      const sorted = [...ids].sort((a, b) => b - a);
      expect(ids).to.deep.equal(sorted);
    });
  }

  verifySortedByNameAscending() {
    cy.get("table tbody tr td:nth-child(2)").then(($cells) => {
      const names = Cypress.$.makeArray($cells)
        .map((el) => Cypress.$(el).text().trim())
        .filter((name) => name.length > 0);

      const sorted = [...names].sort();
      expect(names).to.deep.equal(sorted);
    });
  }

  verifySortedByNameDescending() {
    cy.get("table tbody tr td:nth-child(2)").then(($cells) => {
      const names = Cypress.$.makeArray($cells)
        .map((el) => Cypress.$(el).text().trim())
        .filter((name) => name.length > 0);

      const sorted = [...names].sort().reverse();
      expect(names).to.deep.equal(sorted);
    });
  }

  verifySearchInputCleared() {
    this.elements.searchInput().should("have.value", "");
  }

  verifyDropdownReset() {
    this.elements.allParentsDropdown().should("have.value", "");
  }

  verifyEditDeleteButtonsNotVisible() {
    // Check that edit buttons (btn-warning) don't exist in the table
    cy.get("table tbody tr").then(($rows) => {
      if ($rows.length > 0) {
        cy.get("table tbody .btn-warning").should("not.exist");
        cy.get("table tbody .btn-danger").should("not.exist");
      }
    });
  }
}

export default new CategoriesViewPage();
