import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import PlantsPage from '../../../pages/plants/PlantsPage';

Given('I navigate to plants page', () => {
  PlantsPage.visit();
});

Then('I should see list of plants', () => {
  cy.url().should('include', '/ui/plants');
  cy.contains('Add a Plant').should('be.visible');
});

// TC_UI_PLT_ADMIN_01: Add plant with valid data
When('I click the Add Plant button', () => {
  PlantsPage.clickAddPlant();
});

Then('I should be on the Add Plant page', () => {
  cy.url().should('include', '/ui/plants/add');
});

When('I enter plant name {string}', (name) => {
  // Use unique name so test can run repeatedly (avoids "Plant already exists" error)
  const uniqueName = `${name}-${Date.now()}`;
  cy.wrap(uniqueName).as('newPlantName');
  PlantsPage.fillPlantForm(uniqueName, undefined, undefined, undefined);
});

When('I select the first sub-category for plant', () => {
  PlantsPage.fillPlantForm(undefined, 'first', undefined, undefined);
});

When('I enter plant price {int}', (price) => {
  PlantsPage.fillPlantForm(undefined, undefined, price, undefined);
});

When('I enter plant quantity {int}', (quantity) => {
  PlantsPage.fillPlantForm(undefined, undefined, undefined, quantity);
});

When('I click Save on the plant form', () => {
  PlantsPage.clickSave();
});

Then('I should be redirected to the plant list page', () => {
  PlantsPage.shouldBeOnPlantListPage();
});

Then('I should see the plant {string} in the list', () => {
  // New plants appear at the end; paginate to last page then assert
  cy.goToLastPage();
  cy.get('@newPlantName').then((name) => {
    PlantsPage.shouldContainPlantNamed(name);
  });
});