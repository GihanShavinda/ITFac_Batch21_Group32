import { Before, After } from '@badeball/cypress-cucumber-preprocessor';

// Dummy response so @createPlantResponse exists even if scenario fails before the When step.
// The When step overwrites this with the real API response.
const dummyCreateResponse = { body: {}, status: 0 };

/**
 * PLANTS API HOOKS – Keep database stable for Plant API tests
 * Pattern: Before (set aliases when needed); After (DELETE or restore via API).
 * Uses DELETE /api/plants/{id} with Bearer token. Same pattern in PlantsHooks.js for UI.
 */
/** TC_API_PLT_ADMIN_01: Before = dummy alias; After = delete created plant. */
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

/** After TC_API_PLT_ADMIN_02: delete the plant created/updated in the scenario. */
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

/** After TC_API_PLT_ADMIN_05: delete the plant created with quantity 0. */
After({ tags: '@TC_API_PLT_ADMIN_05' }, function () {
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

/** After TC_API_PLT_USER_04 and TC_API_PLT_USER_05: delete the plant created by admin (authToken is user at end, so re-login as admin to delete). */
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
