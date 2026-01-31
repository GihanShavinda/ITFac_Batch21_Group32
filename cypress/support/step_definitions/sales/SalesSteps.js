import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I navigate to sales page', () => {
  cy.visit('/sales');
});

Then('I should see list of sales orders', () => {
  cy.get('.sales-table').should('be.visible');
});