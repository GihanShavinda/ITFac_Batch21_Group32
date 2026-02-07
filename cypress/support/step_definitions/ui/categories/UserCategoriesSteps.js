import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import CategoriesPage from '../../../../pages/categories/CategoriesPage';

When('I attempt to navigate to {string}', (url) => {
  cy.visit(url, { failOnStatusCode: false });
  cy.wait(1000);
});

When('I attempt to navigate to the edit category page', () => {
  const categoryId = Cypress.env('testCategoryId');
  cy.visit(`/ui/categories/edit/${categoryId}`, { failOnStatusCode: false });
  cy.wait(1000);
});

Then('I should see a forbidden or unauthorized page', () => {
  cy.wait(1000);
  
  cy.url({ timeout: 10000 }).then((currentUrl) => {
    const isOnEditPage = currentUrl.includes('/ui/categories/edit/');
    
    if (isOnEditPage) {
      
      expect(isOnEditPage, `Non-admin user should NOT be able to access edit page at ${currentUrl}. Expected 403 Forbidden page instead.`).to.be.false;
    }
    
    cy.get('body').then(($body) => {
      const pageText = $body.text().toLowerCase();
      const pageHtml = $body.html().toLowerCase();
      const combinedContent = pageText + pageHtml;
      
      const has403Error = combinedContent.includes('403') ||
        combinedContent.includes('forbidden') ||
        combinedContent.includes('access denied') ||
        combinedContent.includes('unauthorized') ||
        combinedContent.includes('permission denied');
      
      expect(has403Error, 'Expected to see 403 Forbidden or unauthorized error page, but error indicators were not found').to.be.true;
    });
  });
});

Then('I should not see delete actions for categories', () => {
  cy.wait(1000);
  
  cy.get('table tbody tr').then(($rows) => {
    if ($rows.length > 0) {
      cy.get('table tbody tr').first().within(() => {
        cy.get('button[title*="delete"], a[title*="delete"]').should('not.exist');
        cy.get('button[aria-label*="delete"], a[aria-label*="delete"]').should('not.exist');
      });
    }
  });
});

Then('I should not see edit actions for categories', () => {
  cy.wait(1000);

  cy.get('table tbody tr').then(($rows) => {
    if ($rows.length > 0) {
      cy.get('table tbody tr').first().within(() => {
        cy.get('button, a').then(($buttons) => {
          const editButtons = $buttons.filter((_, el) => {
            const $el = Cypress.$(el);
            const text = ($el.text() || '').trim().toLowerCase();
            const title = ($el.attr('title') || '').toLowerCase();
            const aria = ($el.attr('aria-label') || '').toLowerCase();
            const href = ($el.attr('href') || '').toLowerCase();

            return text.includes('edit') ||
              title.includes('edit') ||
              aria.includes('edit') ||
              href.includes('/edit/');
          });

          if (editButtons.length === 0) {
            expect(editButtons.length).to.equal(0);
            return;
          }

          cy.wrap(editButtons).each(($btn) => {
            const isDisabled = $btn.is(':disabled') || $btn.attr('aria-disabled') === 'true';
            const isHidden = !Cypress.$($btn).is(':visible');
            expect(isDisabled || isHidden).to.be.true;
          });
        });
      });
    }
  });
});


When('I am logged in as a non-admin user', () => {
  cy.visit('/ui/login', { failOnStatusCode: false });
  cy.get('input[name="username"]').type(Cypress.env('userUsername') || 'testuser');
  cy.get('input[name="password"]').type(Cypress.env('userPassword') || 'test123');
  cy.get('button[type="submit"]').click();
  cy.wait(1000); // Wait for login to complete
});

When('a category with ID {string} exists in the system', (categoryId) => {
  Cypress.env('testCategoryId', categoryId);
});

When('I navigate directly to {string}', (url) => {
  let finalUrl = url;
  
  if (finalUrl.includes('{id}')) {
    const categoryId = Cypress.env('testCategoryId') || '682';
    finalUrl = finalUrl.replace('{id}', categoryId);
  }
  
  if (!finalUrl.startsWith('/')) {
    finalUrl = '/' + finalUrl;
  }
  
  cy.visit(finalUrl, { failOnStatusCode: false });
  cy.wait(1500); // Wait for page to load and any redirects
});

Then('I should see a {string} error page', (errorType) => {
  cy.wait(1000);
  
  cy.url({ timeout: 10000 }).then((currentUrl) => {
    const isOnEditPage = currentUrl.includes('/ui/categories/edit/');
    
    if (isOnEditPage) {
      
      expect(isOnEditPage, `SECURITY VIOLATION: Non-admin user accessed edit page at ${currentUrl}. Backend should return 403 Forbidden and redirect user away from edit page.`).to.be.false;
    }
    
    cy.get('body').then(($body) => {
      const pageText = $body.text().toLowerCase();
      const pageHtml = $body.html().toLowerCase();
      const combinedContent = pageText + pageHtml;
      
      const has403Error = combinedContent.includes('403') ||
        combinedContent.includes('forbidden') ||
        combinedContent.includes('access denied') ||
        combinedContent.includes('unauthorized') ||
        combinedContent.includes('permission denied');
      
      expect(has403Error, `Expected to see ${errorType} error page, but error indicators were not found on the page`).to.be.true;
    });
  });
});

Then('I should not see the category edit form', () => {
  cy.wait(500);
  
  cy.url({ timeout: 5000 }).then((currentUrl) => {
    const isOnEditPage = currentUrl.includes('/ui/categories/edit/');
    
    if (isOnEditPage) {
      
      cy.get('body').then(($body) => {
        const $nameInput = $body.find('input[name="name"], #name, input[type="text"]');
        const $saveButton = $body.find('button').filter((_, el) => {
          const text = Cypress.$(el).text().trim().toLowerCase();
          return text.includes('save') || text.includes('submit') || text.includes('update');
        });
        
        const formExists = $nameInput.length > 0 || $saveButton.length > 0;
        
        if (formExists) {
          
          expect(formExists, `SECURITY VIOLATION: Non-admin user can see category edit form at ${currentUrl}. The backend should prevent access to this page entirely with 403 Forbidden. Form elements found: ${$nameInput.length} inputs, ${$saveButton.length} buttons`).to.be.false;
        }
      });
    }
    
    cy.get('body').then(($body) => {
      const $nameInput = $body.find('input[name="name"], #name, input[type="text"][placeholder*="name" i]');
      const $parentSelect = $body.find('select[name="parentId"], #parentId, select');
      const $saveButton = $body.find('button').filter((_, el) => {
        const text = Cypress.$(el).text().trim().toLowerCase();
        return text.includes('save') || text.includes('submit') || text.includes('update');
      });
      
      const formNotFound = $nameInput.length === 0 && $parentSelect.length === 0 && $saveButton.length === 0;
      
      if (formNotFound) {
        return;
      }
      
      let formDisabled = false;
      
      if ($nameInput.length > 0) {
        formDisabled = $nameInput.is(':disabled');
        expect(formDisabled, 'Category name input should be disabled for non-admin users').to.be.true;
      }
      
      if ($saveButton.length > 0) {
        formDisabled = $saveButton.is(':disabled');
        expect(formDisabled, 'Save button should be disabled for non-admin users').to.be.true;
      }
      
      if (formDisabled) {
      }
    });
  });
});

Then('the page URL should be {string} or {string}', (url1, url2) => {
  cy.url({ timeout: 10000 }).then((currentUrl) => {
    const isOnEditPage = currentUrl.includes('/ui/categories/edit/');
    
    if (isOnEditPage) {
      
      expect(isOnEditPage, `SECURITY VIOLATION: Non-admin user was not redirected from edit page. Current URL: ${currentUrl}. Expected redirect to ${url1} or ${url2}. Backend MUST return 403 Forbidden and redirect user away.`).to.be.false;
    }
    
    const cleanUrl1 = url1.replace(/"/g, '');
    const cleanUrl2 = url2.replace(/"/g, '');
    
    const isValidErrorUrl = currentUrl.includes(cleanUrl1) ||
      currentUrl.includes(cleanUrl2) ||
      currentUrl.includes('403') ||
      currentUrl.includes('forbidden') ||
      currentUrl.includes('error') ||
      currentUrl.includes('unauthorized');
    
    if (!isValidErrorUrl) {
    }
    
    expect(isValidErrorUrl, `Expected URL to be ${cleanUrl1} or ${cleanUrl2}, but got ${currentUrl}`).to.be.true;
  });
});


When('a valid category exists in the system', () => {
  cy.visit('/ui/categories');
  cy.wait(1000);
  
  cy.get('table tbody tr').first().then(($row) => {
    const $editBtn = $row.find('button, a').first();
    
    cy.wrap(1).as('validCategoryId'); // Store a valid ID (assuming ID 1 exists)
  });
});

When('I copy the valid category ID', () => {
  cy.get('@validCategoryId').then((id) => {
    Cypress.env('copiedCategoryId', id);
  });
});

When('I navigate directly to the edit category URL with the copied ID', () => {
  const categoryId = Cypress.env('copiedCategoryId') || 1;
  cy.visit(`/ui/categories/edit/${categoryId}`, { failOnStatusCode: false });
  cy.wait(1000);
});

Then('I should be redirected away from edit page and unable to access it', () => {
  cy.wait(1000);
  
  cy.url({ timeout: 10000 }).then((url) => {
    const isOnEditPage = url.includes('/ui/categories/edit/');
    
    expect(isOnEditPage, `Non-admin user should be redirected away from edit page. Current URL: ${url}`).to.be.false;
    
    const isValidRedirect = url.includes('/ui/categories') ||
      url.includes('login') ||
      url.includes('403') ||
      url.includes('forbidden') ||
      url.includes('unauthorized') ||
      url.includes('error');
    
    expect(isValidRedirect, `Expected redirect to valid page (categories list, login, or error page), but got: ${url}`).to.be.true;
  });
});

Then('I should not be able to view or modify the category edit form', () => {
  cy.wait(1000);
  
  cy.url({ timeout: 10000 }).then((url) => {
    const isOnEditPage = url.includes('/ui/categories/edit/');
    
    if (!isOnEditPage) {
      return;
    }
    
    cy.get('body').then(($body) => {
      const $nameInput = $body.find('input[name="name"], #name');
      const $saveButton = $body.find('button').filter((_, el) =>
        Cypress.$(el).text().trim().toLowerCase().includes('save')
      );
      
      if ($nameInput.length > 0) {
        const isDisabled = $nameInput.is(':disabled');
        expect(isDisabled, 'Category name input must be disabled for non-admin users').to.be.true;
      }
      
      if ($saveButton.length > 0) {
        const isDisabled = $saveButton.is(':disabled');
        expect(isDisabled, 'Save button must be disabled for non-admin users').to.be.true;
      }
    });
  });
});

Then('I should not see the {string} button', (buttonText) => {
  CategoriesPage.shouldNotSeeAddCategoryButton();
});

Then('I should have no option to create a new category', () => {
  cy.contains('a, button', /add.*category|create.*category|new.*category/i).should('not.exist');
});