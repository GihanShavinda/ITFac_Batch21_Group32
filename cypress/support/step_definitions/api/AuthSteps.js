import { Given } from '@badeball/cypress-cucumber-preprocessor';

// Shared API auth: use Bearer token from env or from POST /api/auth/login
Given('I am authenticated as admin for API', () => {
  const token = Cypress.env('adminToken');
  if (token) {
    cy.wrap(token).as('authToken');
    return;
  }
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: Cypress.env('adminUsername') || 'admin',
      password: Cypress.env('adminPassword') || 'admin123',
    },
    failOnStatusCode: false,
  }).then((res) => {
    if (res.status === 200 && res.body?.token) {
      cy.wrap(res.body.token).as('authToken');
    } else {
      throw new Error('Could not get auth token from /api/auth/login. Set adminToken in cypress.config.js env or cypress.env.json.');
    }
  });
});
