// Import commands
import './commands';
import '@shelex/cypress-allure-plugin';

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});