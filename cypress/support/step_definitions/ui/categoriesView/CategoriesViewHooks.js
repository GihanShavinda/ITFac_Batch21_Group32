import { Before, After } from '@badeball/cypress-cucumber-preprocessor';

Before(function () {
  cy.on('uncaught:exception', (err) => {
    return false;
  });
});

After({ tags: '@TC_API_CAT_ADMIN_04' }, function () {});

After({ tags: '@api' }, function (scenario) {
  cy.clearCookies();
  cy.clearLocalStorage();
});

After({ tags: '@ui' }, function (scenario) {
  if (scenario && scenario.result && scenario.pickle) {
    const testName = scenario.pickle.name || 'UI Test';
    if (scenario.result.status === 'FAILED') {
      const screenshotName = testName.replace(/\s+/g, '_').toLowerCase();
      cy.screenshot(`failed_${screenshotName}`, { overwrite: true });
    }
  }
});

After({ tags: '@search or @filter' }, function () {});

After({ tags: '@sort' }, function () {});

After(function (scenario) {});
