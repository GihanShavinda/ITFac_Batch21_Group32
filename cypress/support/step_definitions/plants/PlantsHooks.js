import { After } from '@badeball/cypress-cucumber-preprocessor';

/**
 * After hook for UI scenario "Add plant with valid data" (@TC_UI_PLT_ADMIN_01).
 * The UI flow only knows the plant name (@newPlantName), not the id. We log in via API,
 * list plants, find the one matching @newPlantName, then DELETE by id.
 *
 * Assumes: GET /api/plants returns a list (array or { content: [] } for pageable APIs).
 * If your API uses a different path or pagination, update listUrl or add a search param.
 */
After({ tags: '@TC_UI_PLT_ADMIN_01' }, function () {
  cy.get('@newPlantName').then((name) => {
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

      // List plants; adjust url if your API uses e.g. GET /api/plants/category/1 or ?name=
      cy.request({
        method: 'GET',
        url: '/api/plants',
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then((listRes) => {
        if (listRes.status !== 200) return;
        const body = listRes.body;
        const list = Array.isArray(body) ? body : body?.content ?? body?.data ?? [];
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
