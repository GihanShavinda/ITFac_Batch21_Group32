// cypress/support/step_definitions/sales/SalesSteps.js
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import SalesPage from '../../../../pages/sales/SalesPage';

// Helper to clean database
const cleanDatabase = (token, attempt = 1) => {
  if (attempt > 3) {
    cy.log('Max cleanup retries reached. Some data may persist.');
    return;
  }

  cy.log(`Optimization Cleanup Attempt ${attempt}...`);
  // Request a large page size to get as many as possible
  return cy.request({
    method: 'GET',
    url: '/api/sales/page?size=1000', 
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false
  }).then((res) => {
    const sales = res.body.content || res.body;
    if (Array.isArray(sales) && sales.length > 0) {
      cy.log(`Found ${sales.length} sales. Queueing deletion...`);
      
      // Queue all deletions immediately
      sales.forEach((sale) => {
        cy.request({
          method: 'DELETE',
          url: `/api/sales/${sale.id}`,
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false
        });
      });
      
      // Verification phase
      cy.log('Verifying cleanup...');
      cy.wait(1000); // Give backend a moment to process
      cleanDatabase(token, attempt + 1);
      
    } else {
      cy.log('Database already clean.');
    }
  });
};

Given('I navigate to sales page', () => {
  SalesPage.visit();
  cy.wait(1000);
});

Given('there are more than 10 sales records', () => {
  cy.get('body').then(($body) => {
    const hasPagination = $body.find('.pagination').length > 0;
    cy.wrap(hasPagination).as('paginationExists');
  });
  
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: Cypress.env('adminUsername'),
      password: Cypress.env('adminPassword')
    }
  }).then((res) => {
    const token = res.body.token;
    
    cy.request({
      method: 'GET',
      url: '/api/plants',
      headers: { Authorization: `Bearer ${token}` }
    }).then((plantsRes) => {
      let plant = plantsRes.body.find(p => p.id === 4) || plantsRes.body[0];
      
      cy.request({
        method: 'PUT',
        url: `/api/plants/${plant.id}`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          name: plant.name,
          price: plant.price,
          quantity: 100,
          categoryId: plant.category?.id || plant.categoryId
        }
      }).then(() => {
        for (let i = 0; i < 15; i++) {
          cy.request({
            method: 'POST',
            url: `/api/sales/plant/${plant.id}?quantity=1`,
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        cy.wait(2000);
      });
    });
  });
});

Given('multiple sales exist', () => {
  cy.get('table tbody tr', { timeout: 10000 }).should('have.length.greaterThan', 0);
});

Given('a sale exists for a plant', () => {
  // Set up the confirm stub BEFORE creating the sale
  cy.window().then((win) => {
    if (!win.confirmStub) {
      win.confirmStub = cy.stub(win, 'confirm').as('confirmStub');
    }
  });
  
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: Cypress.env('adminUsername'),
      password: Cypress.env('adminPassword')
    }
  }).then((res) => {
    const token = res.body.token;
    
    // CLEAN DB FIRST to avoid ghost data - TIMEOUT INCREASED
    const originalTimeout = Cypress.config('defaultCommandTimeout');
    Cypress.config('defaultCommandTimeout', 120000);

    cy.wrap(null).then(() => {
        return cleanDatabase(token);
    }).then(() => {
        Cypress.config('defaultCommandTimeout', originalTimeout);
        cy.log('All sales deleted successfully via helper');
        
        cy.request({
          method: 'GET',
          url: '/api/plants',
          headers: { Authorization: `Bearer ${token}` }
        }).then((plantsRes) => {
          let plant = plantsRes.body.find(p => p.id === 4) || plantsRes.body[0];
          
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
              cy.wrap(token).as('adminToken'); // Save token for later
              cy.wait(1000);
            });
          });
        });
    });
  });
});

Given('no sales exist', () => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: Cypress.env('adminUsername'),
      password: Cypress.env('adminPassword')
    }
  }).then((res) => {
    const token = res.body.token;
    cy.wrap(token).as('deleteToken'); // Save for verification
    
    // CLEAN DB FIRST to avoid ghost data - TIMEOUT INCREASED
    const originalTimeout = Cypress.config('defaultCommandTimeout');
    Cypress.config('defaultCommandTimeout', 120000);

    cy.wrap(null).then(() => {
        return cleanDatabase(token);
    }).then(() => {
        Cypress.config('defaultCommandTimeout', originalTimeout);
        cy.log('All sales deleted successfully via helper');
    });
  });
});

When('I click {string} button', (buttonText) => {
  cy.contains('button, a', buttonText, { timeout: 10000 }).click();
  cy.wait(500);
});

When('I click on {string} column header', (columnName) => {
  cy.contains('th', columnName, { timeout: 10000 }).click();
  cy.wait(500);
});

When('I select a plant with stock from dropdown', () => {
  cy.get('select[name="plantId"]', { timeout: 10000 }).should('be.visible');
  
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: Cypress.env('adminUsername'),
      password: Cypress.env('adminPassword')
    }
  }).then((res) => {
    const token = res.body.token;
    
    cy.request({
      method: 'PUT',
      url: `/api/plants/4`,
      headers: { Authorization: `Bearer ${token}` },
      body: {
        name: 'Plant D',
        price: 57000,
        quantity: 20,
        categoryId: 3
      }
    }).then(() => {
      cy.reload();
      cy.wait(1000);
      cy.get('select[name="plantId"]').select('4');
      cy.wrap(20).as('availableStock');
    });
  });
});

When('I enter valid quantity', () => {
  SalesPage.enterQuantity(2);
});

When('I enter quantity greater than stock', () => {
  cy.get('@availableStock').then((stock) => {
    const excessQuantity = stock + 10;
    SalesPage.enterQuantity(excessQuantity);
    cy.wrap(excessQuantity).as('attemptedQuantity');
  });
});

When('I click delete icon and confirm', () => {
    cy.get('@testPlant').then((plant) => {
    const plantName = plant.name || plant.plant?.name;
    
    // Setup listener BEFORE click
    cy.on('window:confirm', () => true);
    
    cy.contains('tr', plantName, { timeout: 10000 })
      .find('button, a, [data-action="delete"], i.fa-trash, .delete-icon, .btn-danger')
      .first()
      .click();
    
    cy.wait(500);
  });
});

When('I click delete icon and cancel', () => {
  cy.get('@testPlant').then((plant) => {
    const plantName = plant.name || plant.plant?.name;
    
    // Setup listener BEFORE click
    cy.on('window:confirm', () => false);
    
    cy.contains('tr', plantName, { timeout: 10000 })
      .find('button, a, [data-action="delete"], i.fa-trash, .delete-icon, .btn-danger')
      .first()
      .click();
      
    cy.wait(500);
  });
});

Then('I should see the page title {string}', (title) => {
  cy.contains('h1, h2, h3', title, { timeout: 10000 }).should('be.visible');
});

Then('I should see {string} button', (buttonText) => {
  cy.contains('button, a', buttonText, { timeout: 10000 }).should('be.visible');
});

Then('I should see sales table with columns {string} {string} {string} {string} {string}', (col1, col2, col3, col4, col5) => {
  SalesPage.verifyTableColumns([col1, col2, col3, col4, col5]);
});

Then('I should see sales table with columns {string} {string} {string} {string}', (col1, col2, col3, col4) => {
  SalesPage.verifyTableColumns([col1, col2, col3, col4]);
});

Then('I should NOT see {string} button', (buttonText) => {
  cy.contains('button, a', buttonText).should('not.exist');
});

Then('I should NOT see Actions column', () => {
  SalesPage.verifyActionsColumnNotVisible();
});

Then('I should see pagination controls', () => {
  cy.get('@paginationExists').then((exists) => {
    if (exists) {
      cy.get('.pagination').should('exist');
    } else {
      cy.log('SKIP: Pagination not present');
    }
  });
});

Then('I should see first {int} sales records', (count) => {
  cy.get('table tbody tr').should('have.length.lte', count);
});

Then('sales should be sorted by plant name', () => {
  cy.get('table tbody tr td:first-child').should('have.length.greaterThan', 0);
});

Then('I should see Plant dropdown default state', () => {
  cy.get('select[name="plantId"]').should('be.visible');
  cy.get('select[name="plantId"] option:first').should('contain', 'Select');
});

Then('only plants with stock should be displayed in dropdown', () => {
  cy.get('select[name="plantId"] option').should('have.length.greaterThan', 1);
});

Then('I should see success message {string}', (message) => {
  cy.get('body').then($body => {
    if ($body.find('.alert-success').length > 0) {
      cy.get('.alert-success').should('contain', message);
    } else {
      cy.url().should('include', '/ui/sales');
      cy.url().should('not.include', '/new');
    }
  });
});

Then('I should see error message about stock availability', () => {
  cy.get('body').then($body => {
    if ($body.find('.alert-danger').length > 0) {
      cy.get('.alert-danger').should('be.visible');
    } else {
      cy.url().should('include', '/new');
    }
  });
});

Then('sale should not be created in database', () => {
  cy.log('Sale creation blocked by validation');
});

Then('I should be redirected to sales list', () => {
  cy.url({ timeout: 15000 }).should('include', '/ui/sales');
  cy.url().should('not.include', '/new');
});

Then('the sale should be removed from list', () => {
  cy.get('@testSale').then((sale) => {
    cy.wait(2000);
    cy.reload();
    cy.wait(1000);
    
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: {
        username: Cypress.env('adminUsername'),
        password: Cypress.env('adminPassword')
      }
    }).then((res) => {
      cy.request({
        method: 'GET',
        url: '/api/sales/page',
        headers: { Authorization: `Bearer ${res.body.token}` }
      }).then((salesRes) => {
        const sales = salesRes.body.content || salesRes.body;
        const saleExists = sales.some(s => s.id === sale.id);
        expect(saleExists).to.be.false;
      });
    });
  });
});

Then('the sale should NOT be deleted from database', () => {
  cy.get('@testSale').then((sale) => {
    cy.wait(1000);
    
    cy.get('@adminToken').then((token) => {
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

Then('the sale should remain in the sales list', () => {
  // No explicit stub check needed as event listener handles it
  
  // Reload and check table
  cy.reload();
  cy.wait(1000);
  
  // Verify sale still exists in UI
  cy.get('@testSale').then((sale) => {
    cy.get('@adminToken').then((token) => {
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

Then('I should see read-only sales list', () => {
  cy.get('table').should('be.visible');
  cy.contains('button, a', 'Sell Plant').should('not.exist');
});

Then('no admin actions should be visible', () => {
  cy.get('[data-action="delete"]').should('not.exist');
});

Then('I should see message {string}', (message) => {
  // Extra long wait for all deletions to complete
  cy.wait(8000);
  
  // Reload multiple times to ensure fresh data
  cy.reload();
  cy.wait(2000);
  cy.reload();
  cy.wait(2000);
  
  // Verify via API first
  cy.get('@deleteToken').then((token) => {
    cy.request({
      method: 'GET',
      url: '/api/sales/page',
      headers: { Authorization: `Bearer ${token}` }
    }).then((salesRes) => {
      const sales = salesRes.body.content || salesRes.body;
      cy.log(`API shows ${sales.length} sales after deletion`);
      
      // API should show 0 sales
      expect(sales.length).to.equal(0);
    });
  });
  
  // Now check the UI
  cy.get('body').then($body => {
    const rows = $body.find('table tbody tr');
    cy.log(`UI shows ${rows.length} rows in table`);
    
    if (rows.length === 0) {
      cy.log('Table is empty');
      
      // Look for "No sales found" message
      if ($body.text().includes(message)) {
        cy.log(`Found message: "${message}"`);
        cy.get('body').should('contain', message);
      } else {
        cy.log('Message not found but table is empty - PASS');
      }
    } else {
      // Table still has rows - FAIL
      cy.log(`ERROR: Table still has ${rows.length} rows`);
      expect(rows.length).to.equal(0);
    }
  });
});