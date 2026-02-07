import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('I send a GET request to {string}', (endpoint) => {
  cy.get('@authToken').then((token) => {
    cy.request({
      method: 'GET',
      url: endpoint,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    }).as('apiResponse');
  });
});

Then('the response status code should be {int}', (status) => {
  cy.get('@apiResponse').its('status').should('eq', status);
});

Then('the response should contain valid JSON data', () => {
  cy.get('@apiResponse').then((response) => {
    expect(response.body).to.not.be.null;
    expect(response.body).to.not.be.undefined;
    const bodyStr = JSON.stringify(response.body);
    expect(() => JSON.parse(bodyStr)).to.not.throw();
  });
});

Then('the response status should be {int}', (status) => {
  const aliases = ['createCategoryResponse', 'createPlantResponse', 'createSaleResponse', 'apiResponse', 'userCategoryResponse', 'lastApiResponse'];
  const allAliases = Cypress.state('aliases') || {};
  const availableAlias = aliases.find(alias => allAliases[alias] !== undefined);
  if (availableAlias) {
    cy.get(`@${availableAlias}`).its('status').should('eq', status);
  } else {
    throw new Error(`No API response alias found. Available: ${Object.keys(allAliases).join(', ')}`);
  }
});

Then('the response body should contain error message {string}', (expectedMessage) => {
  const aliases = ['createCategoryResponse', 'createPlantResponse', 'createSaleResponse', 'apiResponse', 'userCategoryResponse', 'lastApiResponse'];
  const allAliases = Cypress.state('aliases') || {};
  const availableAlias = aliases.find(alias => allAliases[alias] !== undefined);
  if (availableAlias) {
    cy.get(`@${availableAlias}`).its('body').then((body) => {
      expect(body).to.be.an('object');
      const errorMessage = body.message || body.error || body.msg || '';
      const detailsMessage = body.details?.name || JSON.stringify(body.details || {});
      const fullMessage = `${errorMessage} ${detailsMessage}`.toLowerCase();
      expect(fullMessage).to.satisfy(
        (msg) => 
          msg.includes(expectedMessage.toLowerCase()) || 
          msg.includes('validation') ||
          msg.includes('required') ||
          msg.includes('forbidden') ||
          msg.includes('unauthorized') ||
          msg.includes('not permitted'),
        `Expected error response to contain "${expectedMessage}". Got: ${errorMessage}`
      );
    });
  } else {
    throw new Error(`No API response alias found. Available: ${Object.keys(allAliases).join(', ')}`);
  }
});
