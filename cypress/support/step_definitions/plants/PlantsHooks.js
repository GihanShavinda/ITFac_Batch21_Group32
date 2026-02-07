import { Before, After } from '@badeball/cypress-cucumber-preprocessor';

/**
 * PLANTS UI HOOKS – Keep database stable for Plant UI tests
 * Same pattern as PlantsAPIHooks.js: Before/After so every run cleans up created or
 * modified data. After hooks log in via API, then DELETE or PUT /api/plants/{id}.
 * Assumes: GET /api/plants returns a list (array or { content: [] } for pageable APIs).
 */

function adminLoginBody() {
  return cy.env(['adminUsername', 'adminPassword']).then((env) => ({
    username: env.adminUsername || 'admin',
    password: env.adminPassword || 'admin123',
  }));
}

/** TC_UI_PLT_ADMIN_01: Add plant – After: delete the created plant (lookup by @newPlantName). */
After({ tags: '@TC_UI_PLT_ADMIN_01' }, function () {
  cy.get('@newPlantName').then((name) => {
    adminLoginBody().then((body) => {
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body,
        failOnStatusCode: false,
      }).then((loginRes) => {
        if (loginRes.status !== 200 || !loginRes.body?.token) return;
        const token = loginRes.body.token;
        cy.request({
          method: 'GET',
          url: '/api/plants',
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false,
        }).then((listRes) => {
          if (listRes.status !== 200) return;
          const resBody = listRes.body;
          const list = Array.isArray(resBody) ? resBody : resBody?.content ?? resBody?.data ?? [];
          const plant = list.find((p) => p.name === name);
          if (plant?.id) {
            cy.request({
              method: 'DELETE',
              url: `/api/plants/${plant.id}`,
              headers: { Authorization: `Bearer ${token}` },
              failOnStatusCode: false,
            });
          }
        });
      });
    });
  });
});

/** TC_UI_PLT_ADMIN_03: Edit plant – Before: store first plant's data; After: restore via PUT.
 * Assumes API list order matches UI first row.
 */
Before({ tags: '@TC_UI_PLT_ADMIN_03' }, function () {
  cy.wrap(null).as('editPlantOriginal');
  adminLoginBody().then((body) => {
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body,
      failOnStatusCode: false,
    }).then((loginRes) => {
      if (loginRes.status !== 200 || !loginRes.body?.token) return;
      const token = loginRes.body.token;
      cy.request({
        method: 'GET',
        url: '/api/plants',
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then((listRes) => {
        if (listRes.status !== 200) return;
        const body = listRes.body;
        const list = Array.isArray(body) ? body : body?.content ?? body?.data ?? [];
        const first = list[0];
        if (first?.id != null) {
          cy.wrap({
            id: first.id,
            name: first.name,
            price: first.price != null ? Number(first.price) : 10,
            quantity: first.quantity != null ? Number(first.quantity) : 5,
          }).as('editPlantOriginal');
        }
      });
    });
  });

  After({ tags: '@TC_UI_PLT_ADMIN_03' }, function () {
    cy.get('@editPlantOriginal', { timeout: 0 }).then((original) => {
      if (!original?.id) return;
      adminLoginBody().then((body) => {
        cy.request({
          method: 'POST',
          url: '/api/auth/login',
          body,
          failOnStatusCode: false,
        }).then((loginRes) => {
          if (loginRes.status !== 200 || !loginRes.body?.token) return;
          const token = loginRes.body.token;
          cy.request({
            method: 'PUT',
            url: `/api/plants/${original.id}`,
            headers: { Authorization: `Bearer ${token}` },
            body: {
              name: original.name,
              price: original.price,
              quantity: original.quantity,
            },
            failOnStatusCode: false,
          });
        });
      });
    });
  });

  /**
   * TC_UI_PLT_ADMIN_04: Delete plant – Before: create a plant so the scenario deletes test data.
   * No After (the scenario deletes it).
   */
  Before({ tags: '@TC_UI_PLT_ADMIN_04' }, function () {
    const name = `AAA-DeleteTest-${Date.now()}`;
    cy.wrap(name).as('deleteTestPlantName');
    adminLoginBody().then((body) => {
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body,
        failOnStatusCode: false,
      }).then((loginRes) => {
        if (loginRes.status !== 200 || !loginRes.body?.token) return;
        const token = loginRes.body.token;
        cy.request({
          method: 'POST',
          url: '/api/plants/category/1',
          headers: { Authorization: `Bearer ${token}` },
          body: { name, price: 1, quantity: 1 },
          failOnStatusCode: false,
        });
      });
    });
  });

    /** TC_UI_PLT_ADMIN_05: Low stock badge – After: delete the plant (alias @lowStockPlantName). */
    After({ tags: '@TC_UI_PLT_ADMIN_05' }, function () {
      cy.get('@lowStockPlantName').then((name) => {
        adminLoginBody().then((body) => {
          cy.request({
            method: 'POST',
            url: '/api/auth/login',
            body,
            failOnStatusCode: false,
          }).then((loginRes) => {
            if (loginRes.status !== 200 || !loginRes.body?.token) return;
            const token = loginRes.body.token;
            cy.request({
              method: 'GET',
              url: '/api/plants',
              headers: { Authorization: `Bearer ${token}` },
              failOnStatusCode: false,
            }).then((listRes) => {
              if (listRes.status !== 200) return;
              const resBody = listRes.body;
              const list = Array.isArray(resBody) ? resBody : resBody?.content ?? resBody?.data ?? [];
              const plant = list.find((p) => p.name === name);
              if (plant?.id) {
                cy.request({
                  method: 'DELETE',
                  url: `/api/plants/${plant.id}`,
                  headers: { Authorization: `Bearer ${token}` },
                  failOnStatusCode: false,
                });
              }
            });
          });
        });
      });
    });
  });