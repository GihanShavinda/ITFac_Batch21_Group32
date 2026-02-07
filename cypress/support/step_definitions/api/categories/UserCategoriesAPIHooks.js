import { Before, After } from '@badeball/cypress-cucumber-preprocessor';

/**
 * Before hook for user category API security tests.
 * These tests verify that users get 403 Forbidden when attempting admin operations.
 * No cleanup needed since user operations should not create/modify any data.
 */
Before({ tags: '@TC_API_CAT_USER_01 or @TC_API_CAT_USER_02 or @TC_API_CAT_USER_03' }, function () {
  cy.log('Starting user category API security test');
});
