import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

// POST /api/categories with Bearer token; store response for later steps
When(
  'I send a POST request to create a category with name {string} and parentId null',
  (name) => {
    cy.wrap(name).as('apiCategoryName');
    cy.get('@authToken').then((token) => {
      cy.request({
        method: 'POST',
        url: '/api/categories',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          name: name,
        },
        failOnStatusCode: false,
      }).then((response) => {
        cy.log(`Response status: ${response.status}`);
        cy.log(`Response body: ${JSON.stringify(response.body)}`);
        cy.wrap(response).as('createCategoryResponse');
      });
    });
  }
);

// POST /api/categories with parentId for sub-category
When(
  'I send a POST request to create a category with name {string} and parentId {int}',
  (name, parentId) => {
    cy.wrap(name).as('apiCategoryName');
    cy.get('@authToken').then((token) => {
      cy.request({
        method: 'POST',
        url: '/api/categories',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          name: name,
          parentId,
        },
        failOnStatusCode: false,
      }).then((response) => {
        cy.log(`Response status: ${response.status}`);
        cy.log(`Response body: ${JSON.stringify(response.body)}`);
        cy.wrap(response).as('createCategoryResponse');
      });
    });
  }
);

Then('the response body should contain category details', () => {
  cy.get('@createCategoryResponse').its('body').then((body) => {
    expect(body).to.be.an('object');
    // Category details typically include id and/or name
    expect(body).to.satisfy(
      (b) => (b.id !== undefined && b.id !== null) || (b.name !== undefined && b.name !== null),
      'response body should have category id or name'
    );
  });
});
