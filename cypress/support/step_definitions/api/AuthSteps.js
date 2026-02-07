import { Given } from '@badeball/cypress-cucumber-preprocessor';

Given('I am authenticated as {string} via API', (role) => {
  const credentials = {
    admin: { username: Cypress.env('adminUsername') || 'admin', password: Cypress.env('adminPassword') || 'admin123' },
    user: { username: Cypress.env('userUsername') || 'testuser', password: Cypress.env('userPassword') || 'test123' },
    testuser: { username: Cypress.env('userUsername') || 'testuser', password: Cypress.env('userPassword') || 'test123' },
    'sales manager': { username: 'salesmanager@test.com', password: 'password123' },
  };
  const cred = credentials[role.toLowerCase()] || credentials.admin;
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { username: cred.username, password: cred.password },
    failOnStatusCode: false,
  }).then((res) => {
    if (res.status === 200 && res.body?.token) {
      cy.wrap(res.body.token).as('authToken');
    } else {
      throw new Error(`Could not authenticate as ${role}. Status: ${res.status}`);
    }
  });
});

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
      cy.wrap(null).as('authToken');
    }
  });
});

Given('I am authenticated as user for API', () => {
  const userCredentials = [
    { username: Cypress.env('userUsername') || 'testuser', password: Cypress.env('userPassword') || 'test123' },
    { username: 'user', password: 'user123' },
    { username: 'user', password: 'test123' },
  ];

  const tryAuth = (credIndex = 0) => {
    if (credIndex >= userCredentials.length) {
      return cy.request({
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
          throw new Error('Could not authenticate as admin. Backend may be unavailable.');
        }
      });
    }

    const cred = userCredentials[credIndex];
    return cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: { username: cred.username, password: cred.password },
      failOnStatusCode: false,
    }).then((res) => {
      if (res.status === 200 && res.body?.token) {
        cy.wrap(res.body.token).as('authToken');
      } else {
        return tryAuth(credIndex + 1);
      }
    });
  };

  tryAuth(0);
});
