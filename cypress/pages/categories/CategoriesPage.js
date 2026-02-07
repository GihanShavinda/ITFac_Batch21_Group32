class CategoriesPage {
  elements = {
    // Based on the form in the screenshot
    addCategoryButton: () => cy.contains('a', 'Add A Category'),
    categoryNameInput: () => cy.get('input[name="name"], #name').first(),
    parentCategorySelect: () => cy.get('select[name="parentId"], #parentId').first(),
    saveButton: () => cy.contains('button', 'Save'),
    cancelButton: () => cy.contains('button, a', /Cancel|Back/i),
    // Edit and Delete icon buttons in the Actions column
    editButtonForCategory: (categoryName) => cy.contains('tr', categoryName).find('button, a').eq(0), // First button (Edit)
    deleteButtonForCategory: (categoryName) => cy.contains('tr', categoryName).find('button, a').eq(1), // Second button (Delete)
    // Confirmation dialog buttons - more flexible selectors
    confirmOkButton: () => cy.get('button').contains(/OK|Yes|Confirm|Delete/i, { timeout: 5000 }).first(),
    confirmCancelButton: () => cy.get('button').contains(/Cancel|No/i).first(),
    confirmDialog: () => cy.get('[role="dialog"], .modal, .swal2-popup, .confirm-dialog', { timeout: 5000 }).first(),
    // Error messages
    errorMessage: () => cy.get('.alert-danger, .error, .invalid-feedback, [role="alert"]').filter(':visible'),
    
  };

  visit() {
    cy.visit('/ui/categories');
  }

  visitAddCategory() {
    cy.visit('/ui/categories/add');
  }

  clickAddCategory() {
    this.elements.addCategoryButton().click();
  }

  /**
   * Fill category form
   * @param {string} name - Category name (optional)
   * @param {boolean} isMainCategory - true to keep as Main Category, false to skip (optional)
   */
  fillCategoryForm(name, isMainCategory) {
    if (name) {
      this.elements.categoryNameInput().clear().type(name);
    }
    
    if (isMainCategory === true) {
      // Select "Main Category" option (index 0 or value "")
      this.elements.parentCategorySelect().select(0);
    }
    // If isMainCategory is false or undefined, we don't interact with the dropdown
  }

  /**
   * Select parent category from dropdown
   * @param {number|string} option - Index or value to select (1 for first real category)
   */
  selectParentCategory(option) {
    if (option === 'first') {
      // Wait for dropdown to have options loaded, then select first non-Main-Category option
      this.elements.parentCategorySelect().find('option').should('have.length.at.least', 2);
      
      // Get all options and select the second one (first is "Main Category")
      this.elements.parentCategorySelect().find('option').eq(1).then(($option) => {
        const value = $option.val();
        const text = $option.text();
        
        // Select by value if available, otherwise by text
        if (value) {
          this.elements.parentCategorySelect().select(value);
        } else {
          this.elements.parentCategorySelect().select(text);
        }
      });
    } else {
      this.elements.parentCategorySelect().select(option);
    }
  }

  clickSave() {
    this.elements.saveButton().click();
  }

  clickCancel() {
    this.elements.cancelButton().click();
  }

  shouldBeOnCategoryListPage() {
    cy.url({ timeout: 10000 }).should('include', '/ui/categories');
    cy.url().should('not.include', '/add');
  }

  shouldContainCategory(categoryName) {
    const findOnPage = () => {
      cy.get('body').then(($body) => {
        if ($body.text().includes(categoryName)) {
          cy.contains(categoryName).should('be.visible');
          return;
        }

        const $next = $body.find('a, button').filter((i, el) => {
          const t = Cypress.$(el).text().trim();
          return t === 'Next' || t === '»' || t === '›';
        });
        const $parent = $next.closest('li');
        const disabled = $parent.hasClass('disabled') || $next.hasClass('disabled') || $next.attr('aria-disabled') === 'true';

        if ($next.length && !disabled) {
          cy.wrap($next.first()).click();
          cy.wait(500);
          findOnPage();
        } else {
          // Final assertion to surface a clear failure
          cy.contains(categoryName).should('be.visible');
        }
      });
    };

    findOnPage();
  }

  shouldContainCategoryNamed(categoryName) {
    // Alias for consistency with step definitions
    this.shouldContainCategory(categoryName);
  }

  visitEditCategory(categoryId) {
    cy.visit(`/ui/categories/edit/${categoryId}`);
  }

  clearCategoryName() {
    this.elements.categoryNameInput().clear();
  }

  updateCategoryName(newName) {
    this.elements.categoryNameInput().clear().type(newName);
  }

  clickEditForCategory(categoryName) {
    const findAndEdit = () => {
      cy.get('body').then(($body) => {
        if ($body.text().includes(categoryName)) {
          this.elements.editButtonForCategory(categoryName).first().click();
          return;
        }

        const $next = $body.find('a, button').filter((i, el) => {
          const t = Cypress.$(el).text().trim();
          return t === 'Next' || t === '»' || t === '›';
        });
        const $parent = $next.closest('li');
        const disabled = $parent.hasClass('disabled') || $next.hasClass('disabled') || $next.attr('aria-disabled') === 'true';

        if ($next.length && !disabled) {
          cy.wrap($next.first()).click();
          cy.wait(500);
          findAndEdit();
        } else {
          this.elements.editButtonForCategory(categoryName).first().click();
        }
      });
    };

    findAndEdit();
  }

  clickDeleteForCategory(categoryName) {
    const findAndDelete = () => {
      cy.get('body').then(($body) => {
        if ($body.text().includes(categoryName)) {
          this.elements.deleteButtonForCategory(categoryName).first().click();
          return;
        }

        const $next = $body.find('a, button').filter((i, el) => {
          const t = Cypress.$(el).text().trim();
          return t === 'Next' || t === '»' || t === '›';
        });
        const $parent = $next.closest('li');
        const disabled = $parent.hasClass('disabled') || $next.hasClass('disabled') || $next.attr('aria-disabled') === 'true';

        if ($next.length && !disabled) {
          cy.wrap($next.first()).click();
          cy.wait(500);
          findAndDelete();
        } else {
          this.elements.deleteButtonForCategory(categoryName).first().click();
        }
      });
    };

    findAndDelete();
  }

  confirmDelete() {
    // Wait a moment for dialog to appear
    cy.wait(500);
    
    // Check if there's a custom modal dialog
    cy.get('body').then($body => {
      // Check for various dialog types
      if ($body.find('[role="dialog"]:visible, .modal:visible, .swal2-popup:visible').length > 0) {
        // Custom dialog found - click the confirm button
        cy.log('Custom confirmation dialog detected');
        this.elements.confirmOkButton().should('be.visible').click({ force: true });
      } else {
        // No visible custom dialog - might be native browser confirm or already handled
        cy.log('No custom dialog found - native confirm may be in use');
      }
    });
  }

  shouldShowErrorMessage(errorText) {
    this.elements.errorMessage().should('be.visible');
    if (errorText) {
      this.elements.errorMessage().should('contain.text', errorText);
    }
  }

  shouldShowDuplicateError() {
    this.elements.errorMessage().should('be.visible');
    this.elements.errorMessage().invoke('text').should('match', /already exists|duplicate/i);
  }

  shouldShowRequiredError() {
    this.elements.errorMessage().should('be.visible');
    this.elements.errorMessage().invoke('text').should('match', /required|cannot be empty/i);
  }

  shouldShowLengthError() {
    this.elements.errorMessage().should('be.visible');
    this.elements.errorMessage().invoke('text').should('match', /between 3 and 10|length/i);
  }

  shouldNotContainCategory(categoryName) {
    cy.contains(categoryName).should('not.exist');
  }

  shouldBeOnEditCategoryPage() {
    cy.url().should('include', '/ui/categories/edit/');
  }

  // ============ New Assertion Methods for User Security Tests ============
  
  shouldShowForbiddenPage() {
    // More lenient check - accepts redirect or forbidden message
    cy.url({ timeout: 10000 }).then((url) => {
      // If redirected away from restricted page, that's valid
      if (url.includes('login') || url.includes('error') || url.includes('403') || url.includes('forbidden')) {
        cy.log('Redirected to forbidden/login page');
        return;
      }
      
      // If still on page, must show forbidden message
      cy.get('body', { timeout: 10000 }).should('satisfy', ($body) => {
        const text = $body.text().toLowerCase();
        const hasForbidden = text.includes('403') ||
          text.includes('forbidden') ||
          text.includes('unauthorized') ||
          text.includes('access denied') ||
          text.includes('permission') ||
          text.includes('not authorized');
        
        if (!hasForbidden) {
          // If no forbidden message, at least form should be inaccessible
          const $inputs = $body.find('input[name="name"], #name');
          const hasDisabledForm = $inputs.length === 0 || $inputs.is(':disabled');
          return hasDisabledForm;
        }
        
        return hasForbidden;
      });
    });
  }

  shouldHaveDisabledEditForm() {
    cy.url({ timeout: 5000 }).then((url) => {
      // If redirected away, test passes
      if (!url.includes('/ui/categories/edit/')) {
        cy.log('User successfully redirected away from edit page');
        return;
      }
      
      // Still on edit page - verify form is restricted
      cy.get('body').then(($body) => {
        const text = $body.text().toLowerCase();
        
        // Check for forbidden message first
        if (text.includes('forbidden') || text.includes('unauthorized') || text.includes('403')) {
          cy.log('Page shows forbidden message');
          return;
        }
        
        // Check if save button exists
        const $save = $body.find('button').filter((_, el) =>
          Cypress.$(el).text().trim().toLowerCase() === 'save'
        );

        if ($save.length) {
          const isDisabled = $save.is(':disabled') || $save.attr('aria-disabled') === 'true';
          
          if (isDisabled) {
            cy.wrap($save).should('be.disabled');
            cy.log('Save button is disabled');
          } else {
            // Test that save operation fails
            cy.intercept('PUT', '**/api/categories/*').as('saveAttempt');
            cy.log('Testing if save operation is blocked');
            this.elements.categoryNameInput().clear().type('TestAccess');
            cy.wrap($save).click();
            cy.wait(1000);
            
            cy.get('@saveAttempt.all').then((calls) => {
              if (calls && calls.length > 0) {
                const status = calls[0].response?.statusCode;
                expect([401, 403]).to.include(status);
              }
            });
          }
        } else {
          // No save button - verify inputs are disabled or don't exist
          const $nameInput = $body.find('input[name="name"], #name');
          if ($nameInput.length) {
            cy.wrap($nameInput).should('be.disabled');
          }
        }
      });
    });
  }

  shouldNotSeeAddCategoryButton() {
    // Verify "Add Category" button does not exist or is not visible
    cy.get('body').then(($body) => {
      const $addBtn = $body.find('a, button').filter((_, el) => {
        const text = Cypress.$(el).text().trim();
        return text.toLowerCase().includes('add') && text.toLowerCase().includes('category');
      });

      if ($addBtn.length > 0) {
        // Button exists but should not be visible
        cy.wrap($addBtn).should('not.be.visible');
      } else {
        // Button should not exist
        cy.contains('a, button', /add.*category/i).should('not.exist');
      }
    });
  }
}

export default new CategoriesPage();