import { Before, After } from '@badeball/cypress-cucumber-preprocessor';

// Dummy response so @createPlantResponse exists even if scenario fails before the When step.
// The When step overwrites this with the real API response.
const dummyCreateResponse = { body: {}, status: 0 };

/**
 * Before: ensure createPlantResponse alias exists for this scenario.
 * After: delete the created plant by ID so the database is not filled with test data.
 *
 * Uses DELETE /api/plants/{id}. If your API uses a different path (e.g. by category),
 * update the url in the After hook.
 *
 * Note: Cucumber After() does not run when the scenario fails. For cleanup even on
 * failure, use Cypress afterEach() in cypress/support/e2e.js (e.g. for @api tag).
 */
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
