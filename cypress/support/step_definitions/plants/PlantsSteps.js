import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I navigate to plants page', () => {
  cy.visit('/plants');
});

Then('I should see list of plants', () => {
  cy.get('.plants-list').should('be.visible');
});