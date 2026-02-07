import { Before } from '@badeball/cypress-cucumber-preprocessor';

// Before hook for TC_UI_CAT_USER_04: Authorization test
Before({ tags: '@TC_UI_CAT_USER_04' }, function () {
  cy.log('TEST: TC_UI_CAT_USER_04 - Non-admin Direct URL Access');
  cy.log('PURPOSE: Verify non-admin users cannot access edit page via direct URL');
  cy.log('EXPECTED: Backend returns 403 Forbidden, user redirected away');
  cy.log('═══════════════════════════════════════════════════════');
  cy.log('Starting authorization/security test');
  cy.log('Ensuring non-admin user permissions are enforced');
});

// Before hooks for other user security tests
Before({ tags: '@TC_UI_CAT_USER_03 or @TC_UI_CAT_USER_04 or @authorization' }, function () {
  cy.log('Starting user authorization/security test');
  cy.log('Ensuring non-admin user permissions are enforced');
});
