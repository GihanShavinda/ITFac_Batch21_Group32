import { Given } from '@badeball/cypress-cucumber-preprocessor';

// Shared API auth: use Bearer token from env or from POST /api/auth/login
Given('I am authenticated as admin for API', () => {
  const token = Cypress.env('adminToken');
  if (token) {
    cy.wrap(token).as('authToken');
    cy.log('Using pre-configured adminToken from env');
    return;
  }
  cy.log('No adminToken in env, attempting to login via API');
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: Cypress.env('adminUsername') || 'admin',
      password: Cypress.env('adminPassword') || 'admin123',
    },
    failOnStatusCode: false,
  }).then((res) => {
    cy.log('Login response status:', res.status);
    cy.log('Login response:', JSON.stringify(res.body));
    if (res.status === 200 && res.body?.token) {
      cy.log('Auth token received:', res.body.token.substring(0, 20) + '...');
      cy.wrap(res.body.token).as('authToken');
    } else {
      throw new Error('Could not get auth token from /api/auth/login. Status: ' + res.status + ', Response: ' + JSON.stringify(res.body));
    }
  });
});
