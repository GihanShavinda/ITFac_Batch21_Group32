import { After } from '@badeball/cypress-cucumber-preprocessor';

/**
 * After hook for UI scenario "Add main category with valid data" (@TST_CAT_001).
 * The UI flow only knows the category name (@newCategoryName), not the id. We log in via API,
 * list categories, find the one matching @newCategoryName, then DELETE by id.
 *
 * Assumes: GET /api/categories returns a list (array or { content: [] } for pageable APIs).
 * If your API uses a different path or pagination, update listUrl or add a search param.
 */
After({ tags: '@TST_CAT_001' }, function () {
  cy.get('@newCategoryName').then((name) => {
    // Get admin token (UI scenario doesn't set @authToken)
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: {
        username: Cypress.env('adminUsername') || 'admin',
        password: Cypress.env('adminPassword') || 'admin123',
      },
      failOnStatusCode: false,
    }).then((loginRes) => {
      if (loginRes.status !== 200 || !loginRes.body?.token) return;
      const token = loginRes.body.token;

      // List categories; adjust url if your API uses different endpoint
      cy.request({
        method: 'GET',
        url: '/api/categories',
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then((listRes) => {
        if (listRes.status !== 200) return;
        const body = listRes.body;
        const list = Array.isArray(body) ? body : body?.content ?? body?.data ?? [];
        const category = list.find((c) => c.name === name);
        if (category?.id) {
          cy.request({
            method: 'DELETE',
            url: `/api/categories/${category.id}`,
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false,
          });
        }
      });
    });
  });
});

/**
 * After hook for UI scenario "Add sub-category with valid data" (@TST_CAT_002).
 * Cleans up the created sub-category and parent category (if created by test).
 */
After({ tags: '@TST_CAT_002' }, function () {
  cy.get('@newCategoryName').then((subCategoryName) => {
    // Get admin token
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: {
        username: Cypress.env('adminUsername') || 'admin',
        password: Cypress.env('adminPassword') || 'admin123',
      },
      failOnStatusCode: false,
    }).then((loginRes) => {
      if (loginRes.status !== 200 || !loginRes.body?.token) return;
      const token = loginRes.body.token;

      // List categories
      cy.request({
        method: 'GET',
        url: '/api/categories',
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then((listRes) => {
        if (listRes.status !== 200) return;
        const body = listRes.body;
        const list = Array.isArray(body) ? body : body?.content ?? body?.data ?? [];
        
        // Find and delete the sub-category
        const subCategory = list.find((c) => c.name === subCategoryName);
        if (subCategory?.id) {
          cy.request({
            method: 'DELETE',
            url: `/api/categories/${subCategory.id}`,
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false,
          });
        }

        // Check if parent was created by test using Cypress.env or state
        const parentName = Cypress.env('testParentCategoryName');
        if (parentName && parentName.startsWith('TestParent-')) {
          const parentCategory = list.find((c) => c.name === parentName);
          if (parentCategory?.id) {
            cy.request({
              method: 'DELETE',
              url: `/api/categories/${parentCategory.id}`,
              headers: { Authorization: `Bearer ${token}` },
              failOnStatusCode: false,
            }).then(() => {
              // Clear the env variable after cleanup
              Cypress.env('testParentCategoryName', null);
            });
          }
        }
      });
    });
  });
});

/**
 * After hook for boundary tests (@TST_CAT_003, @TST_CAT_004).
 * Cleans up the created category.
 */
After({ tags: '@TST_CAT_003 or @TST_CAT_004' }, function () {
  cy.get('@newCategoryName').then((name) => {
    // Get admin token
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: {
        username: Cypress.env('adminUsername') || 'admin',
        password: Cypress.env('adminPassword') || 'admin123',
      },
      failOnStatusCode: false,
    }).then((loginRes) => {
      if (loginRes.status !== 200 || !loginRes.body?.token) return;
      const token = loginRes.body.token;

      // List categories
      cy.request({
        method: 'GET',
        url: '/api/categories',
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then((listRes) => {
        if (listRes.status !== 200) return;
        const body = listRes.body;
        const list = Array.isArray(body) ? body : body?.content ?? body?.data ?? [];
        const category = list.find((c) => c.name === name);
        if (category?.id) {
          cy.request({
            method: 'DELETE',
            url: `/api/categories/${category.id}`,
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false,
          });
        }
      });
    });
  });
});

/**
 * After hook for TST_CAT_005: Cleanup existing category created for duplicate test
 */
After({ tags: '@TST_CAT_005' }, function () {
  const categoryId = Cypress.env('existingCategoryId');
  if (categoryId) {
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: {
        username: Cypress.env('adminUsername') || 'admin',
        password: Cypress.env('adminPassword') || 'admin123',
      },
      failOnStatusCode: false,
    }).then((loginRes) => {
      if (loginRes.status === 200 && loginRes.body?.token) {
        const token = loginRes.body.token;
        cy.request({
          method: 'DELETE',
          url: `/api/categories/${categoryId}`,
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false,
        });
      }
    });
    Cypress.env('existingCategoryId', null);
  }
});

/**
 * After hook for TST_CAT_006: Cleanup converted category and parent
 */
After({ tags: '@TST_CAT_006' }, function () {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: Cypress.env('adminUsername') || 'admin',
      password: Cypress.env('adminPassword') || 'admin123',
    },
    failOnStatusCode: false,
  }).then((loginRes) => {
    if (loginRes.status === 200 && loginRes.body?.token) {
      const token = loginRes.body.token;
      const categoryId = Cypress.env('testCategoryId');
      const parentId = Cypress.env('testParentId');
      
      if (categoryId) {
        cy.request({
          method: 'DELETE',
          url: `/api/categories/${categoryId}`,
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false,
        });
      }
      
      if (parentId) {
        cy.request({
          method: 'DELETE',
          url: `/api/categories/${parentId}`,
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false,
        });
      }
      
      Cypress.env('testCategoryId', null);
      Cypress.env('testParentId', null);
    }
  });
});

/**
 * After hook for TST_CAT_007, TST_CAT_008, TST_CAT_009: Cleanup edited categories
 */
After({ tags: '@TST_CAT_007 or @TST_CAT_008 or @TST_CAT_009' }, function () {
  const categoryId = Cypress.env('testCategoryId');
  if (categoryId) {
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: {
        username: Cypress.env('adminUsername') || 'admin',
        password: Cypress.env('adminPassword') || 'admin123',
      },
      failOnStatusCode: false,
    }).then((loginRes) => {
      if (loginRes.status === 200 && loginRes.body?.token) {
        const token = loginRes.body.token;
        cy.request({
          method: 'DELETE',
          url: `/api/categories/${categoryId}`,
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false,
        });
      }
    });
    Cypress.env('testCategoryId', null);
  }
});

/**
 * After hook for TST_CAT_010: Category already deleted by test, no cleanup needed
 */
After({ tags: '@TST_CAT_010' }, function () {
  // Category was deleted by the test itself
  Cypress.env('testCategoryId', null);
});

/**
 * After hook for TST_CAT_011: Cleanup parent and sub-category (if not deleted)
 */
After({ tags: '@TST_CAT_011' }, function () {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: Cypress.env('adminUsername') || 'admin',
      password: Cypress.env('adminPassword') || 'admin123',
    },
    failOnStatusCode: false,
  }).then((loginRes) => {
    if (loginRes.status === 200 && loginRes.body?.token) {
      const token = loginRes.body.token;
      const categoryId = Cypress.env('testCategoryId');
      const parentId = Cypress.env('testParentId');
      
      // Try to delete sub-category (might already be deleted)
      if (categoryId) {
        cy.request({
          method: 'DELETE',
          url: `/api/categories/${categoryId}`,
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false,
        });
      }
      
      // Delete parent
      if (parentId) {
        cy.request({
          method: 'DELETE',
          url: `/api/categories/${parentId}`,
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false,
        });
      }
      
      Cypress.env('testCategoryId', null);
      Cypress.env('testParentId', null);
    }
  });
});

/**
 * After hook for TST_CAT_012: Cleanup parent and child categories
 */
After({ tags: '@TST_CAT_012' }, function () {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: Cypress.env('adminUsername') || 'admin',
      password: Cypress.env('adminPassword') || 'admin123',
    },
    failOnStatusCode: false,
  }).then((loginRes) => {
    if (loginRes.status === 200 && loginRes.body?.token) {
      const token = loginRes.body.token;
      const parentId = Cypress.env('testParentId');
      const childId = Cypress.env('testChildId');
      
      // Delete child first
      if (childId) {
        cy.request({
          method: 'DELETE',
          url: `/api/categories/${childId}`,
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false,
        });
      }
      
      // Then delete parent
      if (parentId) {
        cy.request({
          method: 'DELETE',
          url: `/api/categories/${parentId}`,
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false,
        });
      }
      
      Cypress.env('testParentId', null);
      Cypress.env('testChildId', null);
    }
  });
});

