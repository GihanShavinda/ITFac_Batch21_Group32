import { When, Then, Given } from '@badeball/cypress-cucumber-preprocessor';

Given('a category exists with id {int}', (categoryId) => {
  cy.wrap(categoryId).as('existingCategoryId');
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
      }).then(() => {});
    }
  });
});

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
        cy.wrap(response).as('userCategoryResponse');
      });
    });
  }
);

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
        cy.wrap(response).as('userCategoryResponse');
      });
    });
  }
);

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
      cy.wrap(response).as('userCategoryResponse');
    });
  });
});

