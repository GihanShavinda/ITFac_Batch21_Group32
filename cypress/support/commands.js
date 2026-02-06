// Custom Commands
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/login');
  cy.get('#username').type(username);
  cy.get('#password').type(password);
  cy.get('button[type="submit"]').click();
});

// Paginate to the last page (new items often appear at the end). Tries "Last" link first, else clicks "Next" until disabled.
Cypress.Commands.add('goToLastPage', (maxClicks = 50) => {
  cy.get('body').then(($body) => {
    const $last = $body.find('a, button').filter((i, el) => Cypress.$(el).text().trim() === 'Last');
    const $lastParent = $last.closest('li');
    if ($last.length && !$lastParent.hasClass('disabled')) {
      cy.wrap($last.first()).click();
      cy.wait(500);
      return;
    }
    const tryNext = (attempt) => {
      if (attempt >= maxClicks) return;
      cy.get('body').then(($b) => {
        const $next = $b.find('a, button').filter((i, el) => {
          const t = Cypress.$(el).text().trim();
          return t === 'Next' || t === '»' || t === '›';
        });
        const $parent = $next.closest('li');
        const disabled = $parent.hasClass('disabled') || $next.hasClass('disabled') || $next.attr('aria-disabled') === 'true';
        if ($next.length && !disabled) {
          cy.wrap($next.first()).click();
          cy.wait(500);
          cy.get('body').then(() => tryNext(attempt + 1));
        }
      });
    };
    tryNext(0);
  });
});

// Find a plant by name in a paginated list: scan pages (start at current, then Next) until the name is visible.
// Use this when the new/edited plant can appear on any page, not only the last.
Cypress.Commands.add('findPlantInPaginatedList', (plantName, maxPages = 50) => {
  const tryPage = (attempt) => {
    cy.get('body').then(($body) => {
      const found = $body.text().includes(plantName);
      if (found) {
        cy.contains(plantName).should('be.visible');
        return;
      }
      const $next = $body.find('a, button').filter((i, el) => {
        const t = Cypress.$(el).text().trim();
        return t === 'Next' || t === '»' || t === '›';
      });
      const $parent = $next.closest('li');
      const disabled = $parent.hasClass('disabled') || $next.hasClass('disabled') || $next.attr('aria-disabled') === 'true';
      if (attempt >= maxPages || !$next.length || disabled) {
        cy.contains(plantName).should('be.visible');
        return;
      }
      cy.wrap($next.first()).click();
      cy.wait(500);
      tryPage(attempt + 1);
    });
  };
  tryPage(0);
});