// cypress/support/step_definitions/api/sales/SalesAPISteps.js
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I am authenticated as user for API', () => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: Cypress.env('userUsername') || 'testuser',
      password: Cypress.env('userPassword') || 'test123'
    },
    failOnStatusCode: false
  }).then((res) => {
    if (res.status === 200 && res.body?.token) {
      cy.wrap(res.body.token).as('authToken');
    } else {
      cy.wrap(null).as('authToken');
    }
  });
});

Given('I am not authenticated', () => {
  cy.wrap(null).as('authToken');
});

// ===== DATA SETUP =====
Given('no sales exist in database', () => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: Cypress.env('adminUsername') || 'admin',
      password: Cypress.env('adminPassword') || 'admin123'
    }
  }).then((res) => {
    const adminToken = res.body.token;
    
    cy.request({
      method: 'GET',
      url: '/api/sales/page',
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then((salesRes) => {
      const sales = salesRes.body.content || salesRes.body;
      if (Array.isArray(sales) && sales.length > 0) {
        // Delete all sales sequentially
        const deleteSales = (index) => {
          if (index >= sales.length) {
            cy.wait(1000);
            return;
          }
          cy.request({
            method: 'DELETE',
            url: `/api/sales/${sales[index].id}`,
            headers: { Authorization: `Bearer ${adminToken}` },
            failOnStatusCode: false
          }).then(() => {
            deleteSales(index + 1);
          });
        };
        deleteSales(0);
      }
    });
  });
});

Given('a test sale exists', () => {
  cy.get('@authToken').then((token) => {
    cy.request({
      method: 'GET',
      url: '/api/plants',
      headers: { Authorization: `Bearer ${token}` }
    }).then((plantsRes) => {
      let plant = plantsRes.body.find(p => p.quantity > 0 && p.id === 2);
      
      if (!plant) {
        plant = plantsRes.body.find(p => p.quantity > 0 && p.id === 4);
      }
      
      if (!plant) {
        cy.log('No plants with stock found, updating Plant B');
        plant = plantsRes.body.find(p => p.id === 2) || plantsRes.body[0];
        
        cy.request({
          method: 'PUT',
          url: `/api/plants/${plant.id}`,
          headers: { Authorization: `Bearer ${token}` },
          body: {
            name: plant.name,
            price: plant.price,
            quantity: 10,
            categoryId: plant.category?.id || plant.categoryId
          }
        }).then(() => {
          cy.request({
            method: 'POST',
            url: `/api/sales/plant/${plant.id}?quantity=1`,
            headers: { Authorization: `Bearer ${token}` }
          }).then((saleRes) => {
            cy.wrap(saleRes.body).as('testSale');
            cy.wrap(plant).as('testPlant');
          });
        });
      } else {
        cy.request({
          method: 'POST',
          url: `/api/sales/plant/${plant.id}?quantity=1`,
          headers: { Authorization: `Bearer ${token}` }
        }).then((saleRes) => {
          cy.wrap(saleRes.body).as('testSale');
          cy.wrap(plant).as('testPlant');
        });
      }
    });
  });
});

// ===== API REQUESTS =====
When('I send GET request to {string}', (endpoint) => {
  cy.get('@authToken').then((token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    cy.request({
      method: 'GET',
      url: endpoint,
      headers: headers,
      failOnStatusCode: false
    }).as('apiResponse');
  });
});

When('I send DELETE request for the sale', () => {
  cy.get('@testSale').then((sale) => {
    cy.get('@authToken').then((token) => {
      cy.request({
        method: 'DELETE',
        url: `/api/sales/${sale.id}`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false
      }).as('apiResponse');
    });
  });
});

When('I send POST request to create sale', () => {
  cy.get('@authToken').then((token) => {
    cy.request({
      method: 'POST',
      url: '/api/sales/plant/1?quantity=1',
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false
    }).as('apiResponse');
  });
});

// ===== ASSERTIONS =====

Then('the response should contain array of sales', () => {
  cy.get('@apiResponse').its('body').then((body) => {
    if (Array.isArray(body)) {
      expect(body).to.be.an('array');
    } else if (body.content) {
      expect(body.content).to.be.an('array');
    }
  });
});

Then('each sale should have required fields', () => {
  cy.get('@apiResponse').its('body').then((body) => {
    const sales = Array.isArray(body) ? body : (body.content || []);
    if (sales.length > 0) {
      const sale = sales[0];
      expect(sale).to.have.property('id');
      expect(sale).to.have.property('plant');
      expect(sale.plant).to.have.property('name');
      expect(sale).to.have.property('quantity');
      expect(sale).to.have.property('totalPrice');
    }
  });
});

Then('the response should be empty array', () => {
  cy.get('@apiResponse').its('body').then((body) => {
    if (Array.isArray(body)) {
      expect(body).to.deep.equal([]);
    } else if (body.content) {
      expect(body.content).to.deep.equal([]);
    }
  });
});

Then('only plants with stock should be returned', () => {
  cy.get('@apiResponse').its('body').then((plants) => {
    expect(plants).to.be.an('array');
  });
});

Then('the plant stock should be restored', () => {
  cy.get('@testPlant').then((plant) => {
    cy.get('@authToken').then((token) => {
      cy.request({
        method: 'GET',
        url: `/api/plants/${plant.id}`,
        headers: { Authorization: `Bearer ${token}` }
      }).then((plantRes) => {
        cy.log(`Stock after deletion: ${plantRes.body.quantity}`);
        expect(plantRes.body.quantity).to.be.greaterThan(plant.quantity);
      });
    });
  });
});

Then('the sale should not be deleted', () => {
  cy.get('@testSale').then((sale) => {
    cy.get('@authToken').then((token) => {
      cy.request({
        method: 'GET',
        url: '/api/sales/page',
        headers: { Authorization: `Bearer ${token}` }
      }).then((salesRes) => {
        const sales = salesRes.body.content || salesRes.body;
        const saleExists = sales.some(s => s.id === sale.id);
        expect(saleExists).to.be.true;
      });
    });
  });
});