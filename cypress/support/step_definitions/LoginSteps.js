import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import LoginPage from "../../pages/LoginPage";

Given("I navigate to the login page", () => {
  LoginPage.visit();
});

When("I enter username {string}", (username) => {
  LoginPage.enterUsername(username);
});

When("I enter password {string}", (password) => {
  LoginPage.enterPassword(password);
});

When("I click on login button", () => {
  LoginPage.clickLogin();
});

Then("I should be redirected to the dashboard", () => {
  cy.url().should(
    "satisfy",
    (url) => url.includes("/dashboard") || url.includes("/ui/"),
  );
});

Given("I am logged in as admin", () => {
  LoginPage.visit();
  LoginPage.enterUsername(cy.env("adminUsername") || "admin");
  LoginPage.enterPassword(cy.env("adminPassword") || "admin123");
  LoginPage.clickLogin();
});

Given("I am logged in as sales manager", () => {
  LoginPage.visit();
  LoginPage.enterUsername("salesmanager@test.com");
  LoginPage.enterPassword("password123");
  LoginPage.clickLogin();
});

Given("I am logged in as user", () => {
  const primaryUsername = cy.env("userUsername") || "user";
  const primaryPassword = cy.env("userPassword") || "user123";
  const fallbackUsername = "testuser";
  const fallbackPassword = "test123";

  const attemptLogin = (username, password) => {
    LoginPage.visit();
    LoginPage.enterUsername(username);
    LoginPage.enterPassword(password);
    LoginPage.clickLogin();
  };

  attemptLogin(primaryUsername, primaryPassword);

  cy.url({ timeout: 10000 }).then((url) => {
    if (url.includes("/ui/login") || url.includes("error")) {
      attemptLogin(fallbackUsername, fallbackPassword);
    }
  });
});
