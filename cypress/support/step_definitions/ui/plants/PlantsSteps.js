import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import PlantsPage from '../../../../pages/plants/PlantsPage';

Given('I navigate to plants page', () => {
  PlantsPage.visit();
});

Given('at least one plant exists in the system', () => {
  const name = `Plant-${Date.now()}`;
  cy.env(['adminUsername', 'adminPassword']).then((env) => {
    const body = {
      username: env.adminUsername || 'admin',
      password: env.adminPassword || 'admin123',
    };
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body,
      failOnStatusCode: false,
    }).then((loginRes) => {
      if (loginRes.status !== 200 || !loginRes.body?.token) {
        throw new Error('Could not get auth token for creating plant');
      }
      const token = loginRes.body.token;
      cy.request({
        method: 'POST',
        url: '/api/plants/category/1',
        headers: { Authorization: `Bearer ${token}` },
        body: { name, price: 10, quantity: 5 },
        failOnStatusCode: false,
      }).then(() => {
        PlantsPage.visit();
      });
    });
  });
});

Then('I should see list of plants', () => {
  cy.url().should('include', '/ui/plants');
  cy.contains('Add a Plant').should('be.visible');
});

When('I click the Add Plant button', () => {
  PlantsPage.clickAddPlant();
});

Then('I should be on the Add Plant page', () => {
  cy.url().should('include', '/ui/plants/add');
});

When('I enter plant name {string}', (name) => {
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
  cy.get('@newPlantName').then((name) => {
    cy.wait(2000);
    PlantsPage.visit();
    PlantsPage.ensureCategoryFilterIsAll();
    PlantsPage.searchForPlant(name);
    PlantsPage.shouldContainPlantNamed(name);
  });
});

When('I enter plant name for validation {string}', (name) => {
  PlantsPage.fillPlantForm(name, undefined, undefined, undefined);
});

Then('I should see the validation message {string} below the Price field', (message) => {
  PlantsPage.shouldShowValidationMessage(message);
});

Then('I should remain on the Add Plant page', () => {
  PlantsPage.shouldRemainOnAddPlantPage();
});

When('I click Edit for the first plant in the list', () => {
  PlantsPage.clickEditForFirstPlant();
});

Then('I should be on the Edit Plant page', () => {
  PlantsPage.shouldBeOnEditPlantPage();
});

When('I change plant name to {string}', (newName) => {
  const suffix = Date.now().toString().slice(-5);
  const base = String(newName).replace(/\s+/g, '');
  const uniqueName = (base ? `${base}-${suffix}` : `Plant-${suffix}`).slice(0, 25);
  cy.wrap(uniqueName).as('newPlantName');
  PlantsPage.fillPlantForm(uniqueName, 'first', undefined, undefined);
});

Given('I remember the name of the first plant in the list', () => {
  PlantsPage.getFirstPlantName().then((name) => {
    cy.wrap(name).as('deletedPlantName');
  });
});

When('I click Delete for the first plant in the list', () => {
  cy.window().then((win) => {
    cy.stub(win, 'confirm').returns(true);
  });
  PlantsPage.clickDeleteForFirstPlant();
});

When('I confirm the deletion', () => {
});

Then('the plant should no longer appear in the list', () => {
  cy.get('@deletedPlantName').then((name) => {
    PlantsPage.shouldNotContainPlantNamed(name);
  });
});

Given('a plant with quantity 4 exists in the system', () => {
  const name = `LowStock-${Date.now()}`;
  cy.wrap(name).as('lowStockPlantName');
  cy.env(['adminUsername', 'adminPassword']).then((env) => {
    const body = {
      username: env.adminUsername || 'admin',
      password: env.adminPassword || 'admin123',
    };
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body,
      failOnStatusCode: false,
    }).then((loginRes) => {
      if (loginRes.status !== 200 || !loginRes.body?.token) {
        throw new Error('Could not get auth token for creating low-stock plant');
      }
      const token = loginRes.body.token;
      cy.request({
        method: 'POST',
        url: '/api/plants/category/1',
        headers: { Authorization: `Bearer ${token}` },
        body: { name, price: 10, quantity: 4 },
        failOnStatusCode: false,
      });
    });
  });
});

Then('I should see the {string} badge for the low-stock plant we created', (badgeText) => {
  cy.get('@lowStockPlantName').then((name) => {
    PlantsPage.searchForPlant(name);
    PlantsPage.shouldSeeLowBadgeForPlant(name);
  });
});

Then('I should see the plant list with pagination or no plants message', () => {
  PlantsPage.shouldSeePlantListWithPaginationOrNoPlants();
});

When('I search for plant name {string}', (name) => {
  PlantsPage.searchForPlant(name);
});

Then('only plants matching {string} should be displayed', (searchTerm) => {
  PlantsPage.shouldSeeOnlyPlantsMatchingSearch(searchTerm);
});

When('I filter by category on the plant list', () => {
  PlantsPage.filterByCategoryOnList();
});

Then('only plants in the selected category should be displayed', () => {
  PlantsPage.shouldSeeOnlyPlantsInSelectedCategory();
});

When('I sort the plant list by {string}', (field) => {
  PlantsPage.sortListBy(field);
});

Then('the plant list should be sorted by {string}', (field) => {
  PlantsPage.shouldBeSortedBy(field);
});

Then(/^admin actions \(Add Plant, Edit, Delete\) should not be visible$/, () => {
  PlantsPage.shouldNotSeeAdminActions();
});