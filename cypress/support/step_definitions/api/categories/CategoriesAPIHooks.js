import { Before, After } from '@badeball/cypress-cucumber-preprocessor';

const dummyCreateResponse = { body: {}, status: 0 };

Before({ tags: '@TC_API_CAT_ADMIN_01' }, function () {
  cy.wrap(dummyCreateResponse).as('createCategoryResponse');
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
      cy.request({
        method: 'GET',
        url: '/api/categories',
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then((res) => {
        if (res.status === 200 && Array.isArray(res.body)) {
          const mainCategory = res.body.find(cat => cat.name === 'Roses');
          if (mainCategory?.id) {
            cy.request({
              method: 'DELETE',
              url: `/api/categories/${mainCategory.id}`,
              headers: { Authorization: `Bearer ${token}` },
              failOnStatusCode: false,
            });
          } else {
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

Before({ tags: '@TC_API_CAT_ADMIN_03' }, function () {
  cy.wrap(dummyCreateResponse).as('createCategoryResponse');
});

Before({ tags: '@TC_API_CAT_ADMIN_04' }, function () {
  cy.wrap(dummyCreateResponse).as('createCategoryResponse');
});

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
