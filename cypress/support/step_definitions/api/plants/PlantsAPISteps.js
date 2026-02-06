import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

// POST /api/plants/category/{categoryId} with Bearer token; store response for later steps
When(
  'I send a POST request to create a plant with name {string} price {int} quantity {int} in category {int}',
  (name, price, quantity, categoryId) => {
    const uniqueName = `${name}-${Date.now()}`;
    cy.wrap(uniqueName).as('apiPlantName');
    cy.get('@authToken').then((token) => {
      cy.request({
        method: 'POST',
        url: `/api/plants/category/${categoryId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          name: uniqueName,
          price,
          quantity,
        },
        failOnStatusCode: false,
      }).as('createPlantResponse');
    });
  }
);

Then('the response status should be {int}', function (status) {
  // Support both @createPlantResponse (Plants API) and @apiResponse (Sales API)
  // Use "this" to access aliases safely without throwing if one doesn't exist
  const response = this.apiResponse || this.createPlantResponse;
  
  if (response) {
    expect(response.status).to.eq(status);
  } else {
    // If neither exists yet, try to get them via cy.get to be safe (though "this" usually works)
    cy.get('body').then(() => {
       const resp = this.apiResponse || this.createPlantResponse;
       expect(resp.status).to.eq(status);
    });
  }
});

Then('the response body should contain plant details', () => {
  cy.get('@createPlantResponse').its('body').then((body) => {
    expect(body).to.be.an('object');
    // Plant details typically include id and/or name
    expect(body).to.satisfy(
      (b) => (b.id !== undefined && b.id !== null) || (b.name !== undefined && b.name !== null),
      'response body should have plant id or name'
    );
  });
});
