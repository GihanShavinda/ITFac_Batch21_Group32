import { Before, After } from '@badeball/cypress-cucumber-preprocessor';

function adminLoginBody() {
  return cy.env(['adminUsername', 'adminPassword']).then((env) => ({
    username: env.adminUsername || 'admin',
    password: env.adminPassword || 'admin123',
  }));
}

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