import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import DashboardPage from "../../../../pages/dashboard/DashboardPage";

Then("I should be automatically redirected to the dashboard", () => {
  cy.url({ timeout: 5000 }).should(
    "satisfy",
    (url) => url.includes("/dashboard") || url.includes("/ui/"),
  );
});

Then("the dashboard page title {string} should be displayed", (title) => {
  DashboardPage.shouldDisplayTitle(title);
});

Then("the page should load within {int} seconds", (seconds) => {
  const startTime = Date.now();
  DashboardPage.shouldLoadWithinSeconds(seconds);
  cy.wrap(null).then(() => {
    const loadTime = (Date.now() - startTime) / 1000;
    expect(loadTime).to.be.lessThan(seconds + 1);
  });
});

Then("no errors should occur during navigation", () => {
  cy.get("body").invoke("text").then((text) => {
    expect(text).not.to.match(/Internal Server Error|500 Internal|Error 500/i);
    expect(text).not.to.match(/404 Not Found|Not Found\s*404/i);
  });
  cy.window().then((win) => {
    expect(win.document.querySelector(".error-message")).to.be.null;
  });
});

Given("I should be on the dashboard page", () => {
  DashboardPage.shouldBeOnDashboardPage();
});

When("I click on the {string} button on the dashboard", (buttonName) => {
  if (buttonName === "Manage Categories") {
    DashboardPage.clickManageCategoriesButton();
  } else if (buttonName === "Manage Plants") {
    DashboardPage.clickManagePlantsButton();
  } else if (buttonName === "View Sales") {
    DashboardPage.clickViewSalesButton();
  } else {
    cy.contains("button, a, .card, .dashboard-card", buttonName).click();
  }
});

Then("the URL should contain {string}", (urlPart) => {
  cy.url().should("include", urlPart);
});

Then("the sidebar should highlight {string}", (itemName) => {
  DashboardPage.verifySidebarHighlight(itemName);
});

Then("the {string} sidebar item should not be active", (itemName) => {
  DashboardPage.verifySidebarNotActive(itemName);
});

Then("the {string} button should not be visible on the page", (buttonName) => {
  DashboardPage.verifyButtonNotVisible(buttonName);
});

Then("edit and delete icons should not be visible", () => {
  DashboardPage.verifyEditDeleteIconsNotVisible();
});

Then("edit and delete icons should be visible", () => {
  DashboardPage.verifyEditDeleteIconsVisible();
});

Then("delete icons should not be visible", () => {
  DashboardPage.verifyDeleteIconsNotVisible();
});

Then("existing categories should be visible", () => {
  DashboardPage.verifyCategoriesVisible();
});
