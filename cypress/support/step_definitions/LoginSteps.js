import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LoginPage from '../../pages/LoginPage';

Given('I navigate to the login page', () => {
  LoginPage.visit();
});

When('I enter username {string}', (username) => {
  LoginPage.enterUsername(username);
});

When('I enter password {string}', (password) => {
  LoginPage.enterPassword(password);
});

When('I click on login button', () => {
  LoginPage.clickLogin();
});

Then('I should be redirected to the dashboard', () => {
  cy.url().should('include', '/dashboard');
});

Given('I am logged in as admin', () => {
  cy.visit('/login');
  cy.get('#username').type('admin@test.com');
  cy.get('#password').type('password123');
  cy.get('button[type="submit"]').click();
});

Given('I am logged in as sales manager', () => {
  cy.visit('/login');
  cy.get('#username').type('salesmanager@test.com');
  cy.get('#password').type('password123');
  cy.get('button[type="submit"]').click();
});