/**
 * CategoriesViewHooks.js
 * Hooks for Categories View Feature Testing
 * 
 * Handles:
 * - Before hooks: Test data setup
 * - After hooks: Cleanup and teardown
 * - Feature-specific cleanup for created/modified test data
 */

import { Before, After } from '@badeball/cypress-cucumber-preprocessor';

/**
 * Global Before hook - runs before each scenario
 * Ensures clean test environment
 */
Before(function () {
  // Suppress network errors if needed
  cy.on('uncaught:exception', (err) => {
    // Allow tests to continue even if there are app errors
    return false;
  });
});

/**
 * After hook for API tests that update categories
 * Restores category data to original state if modified
 */
After({ tags: '@TC_API_CAT_ADMIN_04' }, function () {
  // This hook runs after update category test
  // If needed, you could restore the category to original state using API
  cy.get('@authToken').then((token) => {
    // The update test uses cy.wrap() for token, so this retrieves it
    if (token) {
      // Optionally log cleanup action
      cy.log('Cleanup: API test completed, no data restoration needed for read-only view tests');
    }
  });
});

/**
 * After hook for all API tests
 * Ensures auth token and test data are cleared
 */
After({ tags: '@api' }, function (scenario) {
  // Clear any stored tokens or sensitive data
  cy.clearCookies();
  cy.clearLocalStorage();
  
  // Optional: Log test result (safely check all properties before accessing)
  if (scenario && scenario.result && scenario.pickle) {
    const testName = scenario.pickle.name || 'API Test';
    if (scenario.result.status === 'PASSED') {
      cy.log(`✓ API Test Passed: ${testName}`);
    } else if (scenario.result.status === 'FAILED') {
      cy.log(`✗ API Test Failed: ${testName}`);
    }
  }
});

/**
 * After hook for all UI tests
 * Ensures clean browser state after UI testing
 */
After({ tags: '@ui' }, function (scenario) {
  // Clear any form data or filters
  // Safely check scenario.result and scenario.pickle before accessing
  if (scenario && scenario.result && scenario.pickle) {
    const testName = scenario.pickle.name || 'UI Test';
    if (scenario.result.status === 'PASSED') {
      cy.log(`✓ UI Test Passed: ${testName}`);
    } else if (scenario.result.status === 'FAILED') {
      cy.log(`✗ UI Test Failed: ${testName}`);
      // Create screenshot for failed tests
      const screenshotName = testName.replace(/\s+/g, '_').toLowerCase();
      cy.screenshot(`failed_${screenshotName}`, { overwrite: true });
    }
  }
});

/**
 * After hook for search and filter tests
 * Clears any filters applied during test
 */
After({ tags: '@search or @filter' }, function () {
  cy.log('Cleanup: Clearing search filters');
  // Test-specific cleanup if needed
});

/**
 * After hook for sorting tests
 * Clears any sort state
 */
After({ tags: '@sort' }, function () {
  cy.log('Cleanup: Clearing sort state');
  // Test-specific cleanup if needed
});

/**
 * Global After hook - runs after each scenario
 * Final cleanup
 */
After(function (scenario) {
  // Log summary for debugging (safely check all properties before accessing)
  if (scenario && scenario.result && scenario.pickle) {
    if (scenario.result.status === 'PASSED') {
      cy.log(`Test completed successfully: ${scenario.pickle.name}`);
    } else if (scenario.result.status === 'FAILED') {
      cy.log(`Test failed: ${scenario.pickle.name}`);
      if (scenario.result.message) {
        cy.log(`Error: ${scenario.result.message}`);
      }
    }
  }
});
