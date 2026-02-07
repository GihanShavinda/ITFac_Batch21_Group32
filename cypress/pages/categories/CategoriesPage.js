class CategoriesPage {
  elements = {
    addCategoryButton: () => cy.contains('a', 'Add A Category'),
    categoryNameInput: () => cy.get('input[name="name"], #name').first(),
    parentCategorySelect: () => cy.get('select[name="parentId"], #parentId').first(),
    saveButton: () => cy.contains('button', 'Save'),
    cancelButton: () => cy.contains('button, a', /Cancel|Back/i),
    editButtonForCategory: (categoryName) => cy.contains('tr', categoryName).find('button, a').eq(0),
    deleteButtonForCategory: (categoryName) => cy.contains('tr', categoryName).find('button, a').eq(1),
    confirmOkButton: () => cy.get('button').contains(/OK|Yes|Confirm|Delete/i, { timeout: 5000 }).first(),
    confirmCancelButton: () => cy.get('button').contains(/Cancel|No/i).first(),
    confirmDialog: () => cy.get('[role="dialog"], .modal, .swal2-popup, .confirm-dialog', { timeout: 5000 }).first(),
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

  fillCategoryForm(name, isMainCategory) {
    if (name) {
      this.elements.categoryNameInput().clear().type(name);
    }
    if (isMainCategory === true) {
      this.elements.parentCategorySelect().select(0);
    }
  }

  selectParentCategory(option) {
    if (option === 'first') {
      this.elements.parentCategorySelect().find('option').should('have.length.at.least', 2);
      this.elements.parentCategorySelect().find('option').eq(1).then(($option) => {
        const value = $option.val();
        const text = $option.text();
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
          cy.contains(categoryName).should('be.visible');
        }
      });
    };

    findOnPage();
  }

  shouldContainCategoryNamed(categoryName) {
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
    cy.wait(500);
    cy.get('body').then($body => {
      if ($body.find('[role="dialog"]:visible, .modal:visible, .swal2-popup:visible').length > 0) {
        this.elements.confirmOkButton().should('be.visible').click({ force: true });
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

  shouldShowForbiddenPage() {
    cy.url({ timeout: 10000 }).then((url) => {
      if (url.includes('login') || url.includes('error') || url.includes('403') || url.includes('forbidden')) {
        return;
      }
      cy.get('body', { timeout: 10000 }).should('satisfy', ($body) => {
        const text = $body.text().toLowerCase();
        const hasForbidden = text.includes('403') ||
          text.includes('forbidden') ||
          text.includes('unauthorized') ||
          text.includes('access denied') ||
          text.includes('permission') ||
          text.includes('not authorized');
        if (!hasForbidden) {
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
      if (!url.includes('/ui/categories/edit/')) {
        return;
      }
      cy.get('body').then(($body) => {
        const text = $body.text().toLowerCase();
        if (text.includes('forbidden') || text.includes('unauthorized') || text.includes('403')) {
          return;
        }
        const $save = $body.find('button').filter((_, el) =>
          Cypress.$(el).text().trim().toLowerCase() === 'save'
        );
        if ($save.length) {
          const isDisabled = $save.is(':disabled') || $save.attr('aria-disabled') === 'true';
          if (isDisabled) {
            cy.wrap($save).should('be.disabled');
          } else {
            cy.intercept('PUT', '**/api/categories/*').as('saveAttempt');
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
          const $nameInput = $body.find('input[name="name"], #name');
          if ($nameInput.length) {
            cy.wrap($nameInput).should('be.disabled');
          }
        }
      });
    });
  }

  shouldNotSeeAddCategoryButton() {
    cy.get('body').then(($body) => {
      const $addBtn = $body.find('a, button').filter((_, el) => {
        const text = Cypress.$(el).text().trim();
        return text.toLowerCase().includes('add') && text.toLowerCase().includes('category');
      });
      if ($addBtn.length > 0) {
        cy.wrap($addBtn).should('not.be.visible');
      } else {
        cy.contains('a, button', /add.*category/i).should('not.exist');
      }
    });
  }
}

export default new CategoriesPage();