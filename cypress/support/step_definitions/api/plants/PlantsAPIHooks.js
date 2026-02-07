import { Before, After } from '@badeball/cypress-cucumber-preprocessor';

const dummyCreateResponse = { body: {}, status: 0 };

Before({ tags: '@TC_API_PLT_ADMIN_01' }, function () {
  cy.wrap(dummyCreateResponse).as('createPlantResponse');
});

After({ tags: '@TC_API_PLT_ADMIN_01' }, function () {
  cy.get('@createPlantResponse').then((res) => {
    const id = res.body?.id;
    if (id != null) {
      cy.get('@authToken').then((token) => {
        cy.request({
          method: 'DELETE',
          url: `/api/plants/${id}`,
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false,
        });
      });
    }
  });
});

After({ tags: '@TC_API_PLT_ADMIN_02' }, function () {
  cy.get('@apiPlantId', { timeout: 0 }).then((id) => {
    cy.get('@authToken').then((token) => {
      cy.request({
        method: 'DELETE',
        url: `/api/plants/${id}`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      });
    });
  });
});

After({ tags: '@TC_API_PLT_ADMIN_05_cleanup' }, function () {
  cy.get('@apiPlantIdForCleanup', { timeout: 0 }).then((id) => {
    cy.get('@authToken').then((token) => {
      cy.request({
        method: 'DELETE',
        url: `/api/plants/${id}`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      });
    });
  });
});

function afterUserUnauthorizedPlant() {
  cy.get('@apiPlantId', { timeout: 0 }).then((id) => {
    cy.env(['adminUsername', 'adminPassword']).then((env) => {
      const body = {
        username: env.adminUsername || 'admin',
        password: env.adminPassword || 'admin123',
      };
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body,
        failOnStatusCode: false,
      }).then((loginRes) => {
        if (loginRes.status === 200 && loginRes.body?.token) {
          cy.request({
            method: 'DELETE',
            url: `/api/plants/${id}`,
            headers: { Authorization: `Bearer ${loginRes.body.token}` },
            failOnStatusCode: false,
          });
        }
      });
    });
  });
}

After({ tags: '@TC_API_PLT_USER_04' }, function () {
  afterUserUnauthorizedPlant();
});

After({ tags: '@TC_API_PLT_USER_05' }, function () {
  afterUserUnauthorizedPlant();
});
