import { Before, After } from '@badeball/cypress-cucumber-preprocessor';

// Dummy response so @createCategoryResponse exists even if scenario fails before the When step.
// The When step overwrites this with the real API response.
const dummyCreateResponse = { body: {}, status: 0 };

/**
 * Before: ensure createCategoryResponse alias exists for this scenario.
 * Also delete any existing category with the same name to avoid duplicates.
 * After: delete the created category by ID so the database is not filled with test data.
 *
 * Uses DELETE /api/categories/{id}.
 *
 * Note: Cucumber After() does not run when the scenario fails. For cleanup even on
 * failure, use Cypress afterEach() in cypress/support/e2e.js (e.g. for @api tag).
 */
Before({ tags: '@TC_API_CAT_ADMIN_01' }, function () {
  cy.wrap(dummyCreateResponse).as('createCategoryResponse');
  
  // Delete existing "Flowers" category if it exists
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: Cypress.env('adminUsername') || 'admin',
      password: Cypress.env('adminPassword') || 'admin123',
    },
    failOnStatusCode: false,
  }).then((authRes) => {
    if (authRes.status === 200 && authRes.body?.token) {
      const token = authRes.body.token;
      
      // Get all categories
      cy.request({
        method: 'GET',
        url: '/api/categories',
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then((res) => {
        if (res.status === 200 && Array.isArray(res.body)) {
          const existingCategory = res.body.find(cat => cat.name === 'Flowers');
          if (existingCategory?.id) {
            cy.request({
              method: 'DELETE',
              url: `/api/categories/${existingCategory.id}`,
              headers: { Authorization: `Bearer ${token}` },
              failOnStatusCode: false,
            });
          }
        }
      });
    }
  });
});

Before({ tags: '@TC_API_CAT_ADMIN_02' }, function () {
  cy.wrap(dummyCreateResponse).as('createCategoryResponse');
  
  // Delete existing "Roses" category if it exists (as main or sub-category)
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: Cypress.env('adminUsername') || 'admin',
      password: Cypress.env('adminPassword') || 'admin123',
    },
    failOnStatusCode: false,
  }).then((authRes) => {
    if (authRes.status === 200 && authRes.body?.token) {
      const token = authRes.body.token;
      
      // Get all categories
      cy.request({
        method: 'GET',
        url: '/api/categories',
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then((res) => {
        if (res.status === 200 && Array.isArray(res.body)) {
          // First check if "Roses" is a main category
          const mainCategory = res.body.find(cat => cat.name === 'Roses');
          if (mainCategory?.id) {
            cy.request({
              method: 'DELETE',
              url: `/api/categories/${mainCategory.id}`,
              headers: { Authorization: `Bearer ${token}` },
              failOnStatusCode: false,
            });
          } else {
            // If not a main category, look for it in subcategories
            for (const category of res.body) {
              if (category.subCategories) {
                const existingSubCat = category.subCategories.find(sub => sub.name === 'Roses');
                if (existingSubCat?.id) {
                  cy.request({
                    method: 'DELETE',
                    url: `/api/categories/${existingSubCat.id}`,
                    headers: { Authorization: `Bearer ${token}` },
                    failOnStatusCode: false,
                  });
                  break;
                }
              }
            }
          }
        }
      });
    }
  });
});

// TC_API_CAT_ADMIN_03: Negative test - no cleanup needed as empty name should fail
Before({ tags: '@TC_API_CAT_ADMIN_03' }, function () {
  cy.wrap(dummyCreateResponse).as('createCategoryResponse');
});

// TC_API_CAT_ADMIN_04: Negative test - no cleanup needed as name too long should fail
Before({ tags: '@TC_API_CAT_ADMIN_04' }, function () {
  cy.wrap(dummyCreateResponse).as('createCategoryResponse');
});

// TC_API_CAT_ADMIN_05: Negative test - no cleanup needed as name too short should fail
Before({ tags: '@TC_API_CAT_ADMIN_05' }, function () {
  cy.wrap(dummyCreateResponse).as('createCategoryResponse');
});

After({ tags: '@TC_API_CAT_ADMIN_01 or @TC_API_CAT_ADMIN_02' }, function () {
  cy.get('@createCategoryResponse').then((res) => {
    const id = res.body?.id;
    if (id != null) {
      cy.get('@authToken').then((token) => {
        cy.request({
          method: 'DELETE',
          url: `/api/categories/${id}`,
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false,
        });
      });
    }
  });
});
