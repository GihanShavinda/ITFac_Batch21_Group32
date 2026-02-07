import { When, Then, Given } from '@badeball/cypress-cucumber-preprocessor';

// "I am authenticated as user for API" is defined in api/AuthSteps.js (sets authToken)

// Verify a category exists (for update/delete tests)
Given('a category exists with id {int}', (categoryId) => {
  cy.wrap(categoryId).as('existingCategoryId');
  // Optional: Verify the category exists by making a GET request as admin
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: Cypress.env('adminUsername') || 'admin',
      password: Cypress.env('adminPassword') || 'admin123',
    },
    failOnStatusCode: false,
  }).then((authRes) => {
    if (authRes.status === 200 && authRes.body?.token) {
      const adminToken = authRes.body.token;
      cy.request({
        method: 'GET',
        url: `/api/categories/${categoryId}`,
        headers: { Authorization: `Bearer ${adminToken}` },
        failOnStatusCode: false,
      }).then((res) => {
        if (res.status === 200) {
          cy.log(`Category ${categoryId} exists`);
        } else {
          cy.log(`Category ${categoryId} may not exist, test will proceed anyway`);
        }
      });
    }
  });
});

// POST /api/categories as user (should fail with 403)
When(
  'I send a POST request to create a category as user with name {string} and parentId null',
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
        cy.wrap(response).as('userCategoryResponse');
      });
    });
  }
);

// PUT /api/categories/{id} as user (should fail with 403)
When(
  'I send a PUT request to update category with id {int} and name {string}',
  (categoryId, name) => {
    cy.wrap(name).as('apiCategoryName');
    cy.get('@authToken').then((token) => {
      cy.request({
        method: 'PUT',
        url: `/api/categories/${categoryId}`,
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
        cy.wrap(response).as('userCategoryResponse');
      });
    });
  }
);

// DELETE /api/categories/{id} as user (should fail with 403)
When('I send a DELETE request to delete category with id {int}', (categoryId) => {
  cy.get('@authToken').then((token) => {
    cy.request({
      method: 'DELETE',
      url: `/api/categories/${categoryId}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      failOnStatusCode: false,
    }).then((response) => {
      cy.log(`Response status: ${response.status}`);
      cy.log(`Response body: ${JSON.stringify(response.body)}`);
      cy.wrap(response).as('userCategoryResponse');
    });
  });
});

