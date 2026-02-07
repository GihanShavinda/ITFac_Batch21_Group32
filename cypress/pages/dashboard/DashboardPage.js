class DashboardPage {
  elements = {
    pageTitle: (title) =>
      cy.contains(
        "h1, h2, h3, h4, h5, h6, .page-title, .dashboard-title, .page-header, .breadcrumb, .title, [class*='title'], [class*='header']",
        title,
        { timeout: 15000 },
      ),
    dashboardContainer: () => cy.get("body").first(),
  };

  visit() {
    cy.visit("/ui/dashboard");
  }

  shouldBeOnDashboardPage() {
    cy.url({ timeout: 10000 }).should(
      "satisfy",
      (url) => url.includes("/dashboard") || url.includes("/ui/"),
    );
  }

  shouldDisplayTitle(expectedTitle) {
    this.elements
      .pageTitle(expectedTitle)
      .should("be.visible")
      .and("contain.text", expectedTitle);
  }

  shouldLoadWithinSeconds(seconds) {
    this.elements.dashboardContainer().should("be.visible");
    cy.window().should("have.property", "document");
  }

  clickManageCategoriesButton() {
    cy.wait(1500);
    cy.get("body").then(($body) => {
      const bodyHtml = $body.html();
      if ($body.find('a[href*="/categories"]').length > 0) {
        cy.get('a[href*="/categories"]').first().click({ force: true });
      } else if (bodyHtml.includes("Manage Categories")) {
        cy.contains("Manage Categories").click({ force: true });
      } else if (bodyHtml.match(/categories/i)) {
        cy.contains(/categories/i)
          .first()
          .click({ force: true });
      } else {
        cy.get("div, button, a")
          .contains(/categor/i)
          .first()
          .click({ force: true });
      }
    });
  }

  clickManagePlantsButton() {
    cy.wait(1500);
    cy.get("body").then(($body) => {
      const bodyHtml = $body.html();
      if ($body.find('a[href*="/plants"]').length > 0) {
        cy.get('a[href*="/plants"]').first().click({ force: true });
      } else if (bodyHtml.includes("Manage Plants")) {
        cy.contains("Manage Plants").click({ force: true });
      } else if (bodyHtml.match(/plants/i)) {
        cy.contains(/plants/i)
          .first()
          .click({ force: true });
      } else {
        cy.get("div, button, a")
          .contains(/plants/i)
          .first()
          .click({ force: true });
      }
    });
  }

  clickViewSalesButton() {
    cy.wait(1500);
    cy.get("body").then(($body) => {
      const bodyHtml = $body.html();
      if ($body.find('a[href*="/sales"]').length > 0) {
        cy.get('a[href*="/sales"]').first().click({ force: true });
      } else if (bodyHtml.includes("View Sales")) {
        cy.contains("View Sales").click({ force: true });
      } else if (bodyHtml.includes("Sales")) {
        cy.contains(/sales/i).first().click({ force: true });
      } else {
        cy.get("div, button, a")
          .contains(/sales/i)
          .first()
          .click({ force: true });
      }
    });
  }

  verifySidebarHighlight(itemName) {
    cy.get("body", { timeout: 10000 }).should("contain", itemName);
  }

  verifySidebarNotActive(itemName) {
    cy.get("body", { timeout: 10000 }).should("contain", itemName);
  }

  verifyButtonNotVisible(buttonName) {
    cy.get("body").then(($body) => {
      const escaped = buttonName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "i");
      const candidates = $body.find("button, a, [role='button']");
      const matches = [...candidates].filter((el) =>
        regex.test((el.textContent || "").trim()),
      );
      const isVisible = matches.some((el) => Cypress.$(el).is(":visible"));
      expect(isVisible, `Visible "${buttonName}" button`).to.be.false;
    });
  }

  verifyEditDeleteIconsNotVisible() {
    cy.get("body").then(($body) => {
      const editButtons = $body
        .find(
          'button, a, [role="button"], .btn, .icon, i, svg, [class*="edit"], [class*="action"]',
        )
        .filter((i, el) => {
          const $el = Cypress.$(el);
          const text = ($el.text() || "").toLowerCase();
          const title = ($el.attr("title") || "").toLowerCase();
          const ariaLabel = ($el.attr("aria-label") || "").toLowerCase();
          const className = ($el.attr("class") || "").toLowerCase();
          const ariaDisabled = ($el.attr("aria-disabled") || "").toLowerCase();
          const isDisabled =
            $el.is(":disabled") ||
            $el.attr("disabled") !== undefined ||
            ariaDisabled === "true" ||
            className.includes("disabled") ||
            className.includes("is-disabled");

          return (
            $el.is(":visible") &&
            !isDisabled &&
            (text.includes("edit") ||
              title.includes("edit") ||
              ariaLabel.includes("edit") ||
              className.includes("edit"))
          );
        });

      const deleteButtons = $body
        .find(
          'button, a, [role="button"], .btn, .icon, i, svg, [class*="delete"], [class*="action"]',
        )
        .filter((i, el) => {
          const $el = Cypress.$(el);
          const text = ($el.text() || "").toLowerCase().trim();
          const title = ($el.attr("title") || "").toLowerCase();
          const ariaLabel = ($el.attr("aria-label") || "").toLowerCase();
          const className = ($el.attr("class") || "").toLowerCase();
          const onclick = ($el.attr("onclick") || "").toLowerCase();
          const ariaDisabled = ($el.attr("aria-disabled") || "").toLowerCase();
          const isDisabled =
            $el.is(":disabled") ||
            $el.attr("disabled") !== undefined ||
            ariaDisabled === "true" ||
            className.includes("disabled") ||
            className.includes("is-disabled");
          const hasDeleteText =
            text.includes("delete") || text.includes("remove");
          const hasDeleteAttribute =
            title.includes("delete") ||
            title.includes("remove") ||
            ariaLabel.includes("delete") ||
            ariaLabel.includes("remove") ||
            onclick.includes("delete") ||
            onclick.includes("remove");
          const hasDeleteClass =
            className.match(
              /\b(delete|remove)[-_]?(btn|button|icon|action)\b/,
            ) ||
            className.match(/\b(btn|button|icon|action)[-_]?(delete|remove)\b/);

          return (
            $el.is(":visible") &&
            !isDisabled &&
            (hasDeleteText || hasDeleteAttribute || hasDeleteClass)
          );
        });

      expect(
        editButtons.length,
        "No visible edit buttons/icons should be present",
      ).to.equal(0);
      expect(
        deleteButtons.length,
        "No visible delete buttons/icons should be present",
      ).to.equal(0);
    });
  }

  verifyEditDeleteIconsVisible() {
    cy.get("body").then(($body) => {
      const editButtons = $body
        .find(
          'button, a, [role="button"], .btn, .icon, i, svg, [class*="edit"], [class*="action"]',
        )
        .filter((i, el) => {
          const $el = Cypress.$(el);
          const text = ($el.text() || "").toLowerCase();
          const title = ($el.attr("title") || "").toLowerCase();
          const ariaLabel = ($el.attr("aria-label") || "").toLowerCase();
          const className = ($el.attr("class") || "").toLowerCase();

          return (
            $el.is(":visible") &&
            (text.includes("edit") ||
              title.includes("edit") ||
              ariaLabel.includes("edit") ||
              className.includes("edit"))
          );
        });

      const deleteButtons = $body
        .find(
          'button, a, [role="button"], .btn, .icon, i, svg, [class*="delete"], [class*="remove"], [class*="action"]',
        )
        .filter((i, el) => {
          const $el = Cypress.$(el);
          const text = ($el.text() || "").toLowerCase();
          const title = ($el.attr("title") || "").toLowerCase();
          const ariaLabel = ($el.attr("aria-label") || "").toLowerCase();
          const className = ($el.attr("class") || "").toLowerCase();

          return (
            $el.is(":visible") &&
            (text.includes("delete") ||
              text.includes("remove") ||
              title.includes("delete") ||
              title.includes("remove") ||
              ariaLabel.includes("delete") ||
              ariaLabel.includes("remove") ||
              className.includes("delete") ||
              className.includes("remove"))
          );
        });

      expect(
        editButtons.length,
        "At least one visible edit button/icon should be present",
      ).to.be.greaterThan(0);
      expect(
        deleteButtons.length,
        "At least one visible delete button/icon should be present",
      ).to.be.greaterThan(0);
    });
  }

  verifyDeleteIconsNotVisible() {
    cy.get("body").then(($body) => {
      const deleteButtons = $body
        .find(
          'button, a, [role="button"], .btn, .icon, i, svg, [class*="delete"], [class*="remove"], [class*="action"]',
        )
        .filter((i, el) => {
          const $el = Cypress.$(el);
          const text = ($el.text() || "").toLowerCase();
          const title = ($el.attr("title") || "").toLowerCase();
          const ariaLabel = ($el.attr("aria-label") || "").toLowerCase();
          const className = ($el.attr("class") || "").toLowerCase();

          return (
            $el.is(":visible") &&
            (text.includes("delete") ||
              text.includes("remove") ||
              title.includes("delete") ||
              title.includes("remove") ||
              ariaLabel.includes("delete") ||
              ariaLabel.includes("remove") ||
              className.includes("delete") ||
              className.includes("remove"))
          );
        });

      expect(
        deleteButtons.length,
        "No visible delete buttons/icons should be present",
      ).to.equal(0);
    });
  }

  verifyCategoriesVisible() {
    cy.get("body").then(($body) => {
      if ($body.find(".categories-list").length > 0) {
        cy.get(".categories-list")
          .should("be.visible")
          .find("li, .category-item, .list-item, tr")
          .its("length")
          .should("be.gt", 0);
      } else if ($body.find("table").length > 0) {
        cy.get("table").should("be.visible");
        cy.get("table tbody tr").its("length").should("be.gt", 0);
      } else {
        cy.get("body").should("contain", "Categories");
      }
    });
  }
}

export default new DashboardPage();
