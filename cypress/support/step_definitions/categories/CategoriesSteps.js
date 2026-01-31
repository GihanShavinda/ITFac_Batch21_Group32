import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I navigate to categories page', () => {
  cy.visit('/categories');
});

Then('I should see list of categories', () => {
  cy.get('.categories-list').should('be.visible');
});