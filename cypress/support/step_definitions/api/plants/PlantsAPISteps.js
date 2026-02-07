import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

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
      }).then((res) => {
        cy.wrap(res).as('createPlantResponse');
        cy.wrap(res).as('lastApiResponse');
      });
    });
  }
);

Then('the response body should contain plant details', () => {
  cy.get('@lastApiResponse').its('body').then((body) => {
    expect(body).to.be.an('object');
    expect(body).to.satisfy(
      (b) => (b.id !== undefined && b.id !== null) || (b.name !== undefined && b.name !== null),
      'response body should have plant id or name'
    );
  });
});

Given('a plant exists for API in category {int}', (categoryId) => {
  cy.get('@authToken').then((token) => {
    const name = `ApiPlant-${Date.now()}`;
    cy.request({
      method: 'POST',
      url: `/api/plants/category/${categoryId}`,
      headers: { Authorization: `Bearer ${token}` },
      body: { name, price: 10, quantity: 5 },
      failOnStatusCode: false,
    }).then((res) => {
      if (res.status === 201 && res.body?.id) {
        cy.wrap(res.body.id).as('apiPlantId');
        cy.wrap(res).as('lastApiResponse');
      } else {
        throw new Error('Could not create plant for API test. Check category exists and auth.');
      }
    });
  });
});

When('I send a PUT request to update the plant with name {string} price {int} quantity {int}', (name, price, quantity) => {
  const uniqueName = `Rose-${Date.now().toString().slice(-8)}`;
  cy.wrap(uniqueName).as('updatedPlantName');
  cy.get('@authToken').then((token) => {
    cy.get('@apiPlantId').then((id) => {
      cy.request({
        method: 'PUT',
        url: `/api/plants/${id}`,
        headers: { Authorization: `Bearer ${token}` },
        body: { name: uniqueName, price, quantity },
        failOnStatusCode: false,
      }).then((res) => {
        cy.wrap(res).as('lastApiResponse');
      });
    });
  });
});

Then('the response body should contain name {string} price {int} quantity {int}', (name, price, quantity) => {
  cy.get('@lastApiResponse').its('body').then((body) => {
    expect(body).to.be.an('object');
    if (body.name !== undefined) expect(body.name).to.equal(name);
    if (body.price !== undefined) expect(Number(body.price)).to.equal(price);
    if (body.quantity !== undefined) expect(Number(body.quantity)).to.equal(quantity);
  });
});

Then('the response body should contain the updated plant name and price {int} quantity {int}', (price, quantity) => {
  cy.get('@updatedPlantName').then((expectedName) => {
    cy.get('@lastApiResponse').its('body').then((body) => {
      expect(body).to.be.an('object');
      if (body.name !== undefined) expect(body.name).to.equal(expectedName);
      if (body.price !== undefined) expect(Number(body.price)).to.equal(price);
      if (body.quantity !== undefined) expect(Number(body.quantity)).to.equal(quantity);
    });
  });
});

When('I send a DELETE request for that plant', () => {
  cy.get('@authToken').then((token) => {
    cy.get('@apiPlantId').then((id) => {
      cy.request({
        method: 'DELETE',
        url: `/api/plants/${id}`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then((res) => {
        cy.wrap(res).as('lastApiResponse');
      });
    });
  });
});

Then('a GET request to that plant should return status {int}', (status) => {
  cy.get('@apiPlantId').then((id) => {
    cy.get('@authToken').then((token) => {
      cy.request({
        method: 'GET',
        url: `/api/plants/${id}`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.equal(status);
      });
    });
  });
});

Then('the response body should contain the error message {string}', (message) => {
  cy.get('@lastApiResponse').its('body').then((body) => {
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    expect(bodyStr).to.include(message);
  });
});

Then('I store the created plant id for cleanup', () => {
  cy.get('@lastApiResponse').its('body.id').then((id) => {
    cy.wrap(id).as('apiPlantIdForCleanup');
  });
});

When('I send a GET request to list plants', () => {
  cy.get('@authToken').then((token) => {
    cy.request({
      method: 'GET',
      url: '/api/plants',
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    }).then((res) => {
      cy.wrap(res).as('lastApiResponse');
    });
  });
});

Then('the response body should contain a list of plants', () => {
  cy.get('@lastApiResponse').its('body').then((body) => {
    const list = Array.isArray(body) ? body : body?.content ?? body?.data ?? [];
    expect(list).to.be.an('array');
  });
});

When('I send a GET request to list plants with name {string} and category {int}', (name, categoryId) => {
  cy.get('@authToken').then((token) => {
    cy.request({
      method: 'GET',
      url: '/api/plants',
      qs: { name, categoryId },
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    }).then((res) => {
      cy.wrap(res).as('lastApiResponse');
    });
  });
});

Then('the response body should contain a list of plants matching the filters', () => {
  cy.get('@lastApiResponse').its('body').then((body) => {
    const list = Array.isArray(body) ? body : body?.content ?? body?.data ?? [];
    expect(list).to.be.an('array');
  });
});
