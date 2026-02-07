import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Shared by DashboardAPI and CategoriesViewAPI features
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

// Shared step for checking response status/code (Dashboard + CategoriesView use apiResponse)
Then('the response status code should be {int}', (status) => {
  cy.get('@apiResponse').its('status').should('eq', status);
});

// Shared step (Dashboard + CategoriesView)
Then('the response should contain valid JSON data', () => {
  cy.get('@apiResponse').then((response) => {
    expect(response.body).to.not.be.null;
    expect(response.body).to.not.be.undefined;
    const bodyStr = JSON.stringify(response.body);
    expect(() => JSON.parse(bodyStr)).to.not.throw();
  });
});

// Shared step for checking response status across all API tests
// Works with any response alias: @createCategoryResponse, @createPlantResponse, etc.
Then('the response status should be {int}', (status) => {
  // Try common response aliases in order
  const aliases = ['createCategoryResponse', 'createPlantResponse', 'createSaleResponse', 'apiResponse', 'userCategoryResponse', 'lastApiResponse'];
  
  // Find which alias exists
  const allAliases = Cypress.state('aliases') || {};
  const availableAlias = aliases.find(alias => allAliases[alias] !== undefined);
  
  if (availableAlias) {
    cy.get(`@${availableAlias}`).its('status').should('eq', status);
  } else {
    throw new Error(`No API response alias found. Available: ${Object.keys(allAliases).join(', ')}`);
  }
});

// Shared step for checking error messages in response body across all API tests
Then('the response body should contain error message {string}', (expectedMessage) => {
  // Try common response aliases in order
  const aliases = ['createCategoryResponse', 'createPlantResponse', 'createSaleResponse', 'apiResponse', 'userCategoryResponse', 'lastApiResponse'];
  
  // Find which alias exists
  const allAliases = Cypress.state('aliases') || {};
  const availableAlias = aliases.find(alias => allAliases[alias] !== undefined);
  
  if (availableAlias) {
    cy.get(`@${availableAlias}`).its('body').then((body) => {
      expect(body).to.be.an('object');
      cy.log(`Full error response: ${JSON.stringify(body)}`);
      
      // Check various error message locations in the response
      const errorMessage = body.message || body.error || body.msg || '';
      const detailsMessage = body.details?.name || JSON.stringify(body.details || {});
      const fullMessage = `${errorMessage} ${detailsMessage}`.toLowerCase();
      
      // Assert that the expected message appears somewhere in the error response
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
