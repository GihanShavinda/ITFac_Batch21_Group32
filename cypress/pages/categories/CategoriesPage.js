class CategoriesPage {
  elements = {
    // Based on the form in the screenshot
    addCategoryButton: () => cy.contains('a', 'Add A Category'),
    categoryNameInput: () => cy.get('input[name="name"], #name').first(),
    parentCategorySelect: () => cy.get('select[name="parentId"], #parentId').first(),
    saveButton: () => cy.contains('button', 'Save'),
    cancelButton: () => cy.contains('button', 'Cancel'),
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
    cy.contains(categoryName).should('be.visible');
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
    cy.goToLastPage(); // Category might be on last page
    this.elements.editButtonForCategory(categoryName).first().click();
  }

  clickDeleteForCategory(categoryName) {
    cy.goToLastPage(); // Category might be on last page
    this.elements.deleteButtonForCategory(categoryName).first().click();
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
}

export default new CategoriesPage();