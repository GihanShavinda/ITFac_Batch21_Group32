Cypress.Commands.add('login', (username, password) => {
  cy.visit('/login');
  cy.get('#username').type(username);
  cy.get('#password').type(password);
  cy.get('button[type="submit"]').click();
});

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