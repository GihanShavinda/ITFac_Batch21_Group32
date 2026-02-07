// cypress/support/step_definitions/api/AuthSteps.js
import { Given } from '@badeball/cypress-cucumber-preprocessor';

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
      // Don't throw error - just wrap null
      cy.wrap(null).as('authToken');
    }
  });
});

Given('I am authenticated as user for API', () => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: Cypress.env('userUsername') || 'testuser',
      password: Cypress.env('userPassword') || 'test123',
    },
    failOnStatusCode: false,
  }).then((res) => {
    if (res.status === 200 && res.body?.token) {
      cy.wrap(res.body.token).as('authToken');
    } else {
      throw new Error('Could not get user auth token from /api/auth/login. Check userUsername/userPassword in cypress.config.js.');
    }
  });
});
