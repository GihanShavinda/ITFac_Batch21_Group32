import { Given } from '@badeball/cypress-cucumber-preprocessor';

// Shared API auth: use Bearer token from env or from POST /api/auth/login
Given('I am authenticated as admin for API', () => {
  const token = cy.env('adminToken');
  if (token) {
    cy.wrap(token).as('authToken');
    return;
  }
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: cy.env('adminUsername') || 'admin',
      password: cy.env('adminPassword') || 'admin123',
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

Given('I am authenticated as user for API', () => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: cy.env('userUsername') || 'testuser',
      password: cy.env('userPassword') || 'test123',
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
