import { After } from '@badeball/cypress-cucumber-preprocessor';

function isCategoriesFeature(scenario) {
  const uri = scenario?.pickle?.uri ?? scenario?.uri ?? '';
  if (typeof uri === 'string' && uri.includes('CategoriesView')) return false;
  if (typeof uri === 'string' && uri.includes('Categories.feature')) return true;
  const name = scenario?.pickle?.name ?? '';
  return !name.includes('Verify Categories page') && !name.includes('Search categories by');
}

After({ tags: '@TC_UI_CAT_ADMIN_01' }, function (scenario) {
  if (!isCategoriesFeature(scenario)) return;
  cy.get('@newCategoryName').then((name) => {
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

After({ tags: '@TC_UI_CAT_ADMIN_02' }, function (scenario) {
  if (!isCategoriesFeature(scenario)) return;
  cy.get('@newCategoryName').then((subCategoryName) => {
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
      cy.request({
        method: 'GET',
        url: '/api/categories',
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then((listRes) => {
        if (listRes.status !== 200) return;
        const body = listRes.body;
        const list = Array.isArray(body) ? body : body?.content ?? body?.data ?? [];
        const subCategory = list.find((c) => c.name === subCategoryName);
        if (subCategory?.id) {
          cy.request({
            method: 'DELETE',
            url: `/api/categories/${subCategory.id}`,
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false,
          });
        }
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
              Cypress.env('testParentCategoryName', null);
            });
          }
        }
      });
    });
  });
});

After({ tags: '@TC_UI_CAT_ADMIN_03 or @TC_UI_CAT_ADMIN_04' }, function (scenario) {
  if (!isCategoriesFeature(scenario)) return;
  cy.get('@newCategoryName').then((name) => {
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

After({ tags: '@TC_UI_CAT_ADMIN_05' }, function () {
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

After({ tags: '@TC_UI_CAT_ADMIN_06' }, function () {
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

After({ tags: '@TC_UI_CAT_ADMIN_07 or @TC_UI_CAT_ADMIN_08 or @TC_UI_CAT_ADMIN_09' }, function () {
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

After({ tags: '@TC_UI_CAT_ADMIN_10' }, function () {
  Cypress.env('testCategoryId', null);
});

After({ tags: '@TC_UI_CAT_ADMIN_11' }, function () {
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

After({ tags: '@TC_UI_CAT_ADMIN_12' }, function () {
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
      if (childId) {
        cy.request({
          method: 'DELETE',
          url: `/api/categories/${childId}`,
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
      
      Cypress.env('testParentId', null);
      Cypress.env('testChildId', null);
    }
  });
});

