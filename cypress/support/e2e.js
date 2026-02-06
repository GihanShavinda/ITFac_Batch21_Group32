// cypress/support/e2e.js
// Import commands
import './commands';

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});