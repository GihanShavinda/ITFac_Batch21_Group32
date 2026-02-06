import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import CategoriesPage from '../../../pages/categories/CategoriesPage';

Given('I navigate to categories page', () => {
  // Wait a bit after login to ensure session is established
  cy.wait(1000);
  CategoriesPage.visit();
});

Then('I should see list of categories', () => {
  cy.url().should('include', '/ui/categories');
  cy.contains('Add A Category').should('be.visible');
});

// TST_CAT_001: Add main category with valid data
When('I click the Add Category button', () => {
  CategoriesPage.clickAddCategory();
});

Then('I should be on the Add Category page', () => {
  cy.url().should('include', '/ui/categories/add');
});

When('I enter category name {string}', (name) => {
  // For boundary tests (TST-CAT-003, TST-CAT-004), use exact name
  // For other tests, add random suffix to keep it under 10 chars
  let categoryName;
  
  if (name === "Abc" || name === "Abcdefghij") {
    // Exact boundary test - use the name as-is
    categoryName = name;
  } else {
    // Regular tests - to keep it under 10 chars, we use name prefix + short random number
    categoryName = name.substring(0, 5) + Math.floor(Math.random() * 999);
  }
  
  cy.wrap(categoryName).as('newCategoryName');
  CategoriesPage.fillCategoryForm(categoryName, false);
});

When('I keep it as a Main Category', () => {
  CategoriesPage.fillCategoryForm(undefined, true);
});

When('I click Save on the category form', () => {
  CategoriesPage.clickSave();
  // Add a wait to allow redirect to complete
  cy.wait(2000);
});

Then('I should be redirected to the category list page', () => {
  CategoriesPage.shouldBeOnCategoryListPage();
});

Then('I should see the category {string} in the list', () => {
  // Use existing custom command to ensure we see the latest entry
  cy.goToLastPage();
  cy.get('@newCategoryName').then((name) => {
    CategoriesPage.shouldContainCategory(name);
  });
});

// TST_CAT_002: Add sub-category with valid data
Given('at least one main category exists', () => {
  // Check if a main category exists, if not create one
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: Cypress.env('adminUsername') || 'admin',
      password: Cypress.env('adminPassword') || 'admin123',
    },
    failOnStatusCode: false,
  }).then((loginRes) => {
    if (loginRes.status === 200 && loginRes.body?.token) {
      const token = loginRes.body.token;
      
      // Check if categories exist
      cy.request({
        method: 'GET',
        url: '/api/categories',
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then((listRes) => {
        if (listRes.status === 200) {
          const body = listRes.body;
          const list = Array.isArray(body) ? body : body?.content ?? body?.data ?? [];
          
          // If no main categories exist, create one
          if (list.length === 0) {
            const parentCategoryName = `TestParent-${Date.now()}`;
            
            // Store in Cypress.env for cleanup
            Cypress.env('testParentCategoryName', parentCategoryName);
            
            cy.request({
              method: 'POST',
              url: '/api/categories',
              headers: { Authorization: `Bearer ${token}` },
              body: {
                name: parentCategoryName,
                parentId: null
              },
              failOnStatusCode: false,
            });
          } else {
            // No need to clean up existing categories
            Cypress.env('testParentCategoryName', null);
          }
        }
      });
    }
  });
  
  // Wait for any API operations to complete
  cy.wait(1000);
});

When('I select the first parent category', () => {
  CategoriesPage.selectParentCategory('first');
});

// TST_CAT_005: Add duplicate category name
Given('a category {string} already exists', (categoryName) => {
  // Create a category via API
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: Cypress.env('adminUsername') || 'admin',
      password: Cypress.env('adminPassword') || 'admin123',
    },
  }).then((loginRes) => {
    const token = loginRes.body.token;
    cy.request({
      method: 'POST',
      url: '/api/categories',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: categoryName, parentId: null },
      failOnStatusCode: false,
    }).then((res) => {
      if (res.body?.id) {
        Cypress.env('existingCategoryId', res.body.id);
      }
    });
  });
  cy.wait(1000);
});

When('I enter exact category name {string}', (name) => {
  cy.wrap(name).as('newCategoryName');
  CategoriesPage.fillCategoryForm(name, false);
});

Then('I should see an error message about duplicate category', () => {
  CategoriesPage.shouldShowDuplicateError();
});

// TST_CAT_006: Convert sub-category to main category
Given('a sub-category exists for editing', () => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: Cypress.env('adminUsername') || 'admin',
      password: Cypress.env('adminPassword') || 'admin123',
    },
    failOnStatusCode: false,
  }).then((loginRes) => {
    const token = loginRes.body.token;
    
    // Create parent category (under 10 chars)
    cy.request({
      method: 'POST',
      url: '/api/categories',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: `Par${Math.floor(Math.random() * 999)}`, parentId: null },
      failOnStatusCode: false,
    }).then((parentRes) => {
      const parentId = parentRes.body.id;
      Cypress.env('testParentId', parentId);
      
      // Create sub-category (under 10 chars)
      const subName = `Sub${Math.floor(Math.random() * 9999)}`;
      cy.request({
        method: 'POST',
        url: '/api/categories',
        headers: { Authorization: `Bearer ${token}` },
        body: { name: subName, parentId: parentId },
        failOnStatusCode: false,
      }).then((subRes) => {
        Cypress.env('testCategoryId', subRes.body.id);
        cy.wrap(subName).as('testCategoryName');
      });
    });
  });
  cy.wait(1000);
});

When('I navigate to edit that sub-category', () => {
  const categoryId = Cypress.env('testCategoryId');
  CategoriesPage.visitEditCategory(categoryId);
});

Then('I should be on the Edit Category page', () => {
  CategoriesPage.shouldBeOnEditCategoryPage();
});

When('I change parent to Main Category', () => {
  CategoriesPage.fillCategoryForm(undefined, true);
});

Then('the category should be a main category', () => {
  // Verify via API that category has no parent
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: Cypress.env('adminUsername') || 'admin',
      password: Cypress.env('adminPassword') || 'admin123',
    },
  }).then((loginRes) => {
    const token = loginRes.body.token;
    const categoryId = Cypress.env('testCategoryId');
    
    cy.request({
      method: 'GET',
      url: `/api/categories/${categoryId}`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body.parentId).to.be.null;
    });
  });
});

// TST_CAT_007: Edit category name successfully
Given('a category exists for editing', () => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: Cypress.env('adminUsername') || 'admin',
      password: Cypress.env('adminPassword') || 'admin123',
    },
    failOnStatusCode: false,
  }).then((loginRes) => {
    const token = loginRes.body.token;
    // Keep name under 10 chars
    const categoryName = `Edit${Math.floor(Math.random() * 999)}`;
    
    cy.request({
      method: 'POST',
      url: '/api/categories',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: categoryName, parentId: null },
      failOnStatusCode: false,
    }).then((res) => {
      Cypress.env('testCategoryId', res.body.id);
      cy.wrap(categoryName).as('originalCategoryName');
    });
  });
  cy.wait(1000);
});

When('I navigate to edit that category', () => {
  const categoryId = Cypress.env('testCategoryId');
  CategoriesPage.visitEditCategory(categoryId);
});

When('I update category name to {string}', (newName) => {
  // For length test (Abcdefghijk - 11 chars), use exact name
  // For other tests, generate short unique name
  let uniqueName;
  if (newName === "Abcdefghijk") {
    uniqueName = newName; // 11 chars for validation test
  } else if (newName === "UpdatedName") {
    uniqueName = `Upd${Math.floor(Math.random() * 999)}`; // Keep under 10 chars
  } else {
    uniqueName = newName;
  }
  cy.wrap(uniqueName).as('newCategoryName');
  CategoriesPage.updateCategoryName(uniqueName);
});

// TST_CAT_008: Edit category with empty name
When('I clear the category name field', () => {
  CategoriesPage.clearCategoryName();
});

Then('I should see a validation error about required name', () => {
  CategoriesPage.shouldShowRequiredError();
});

// TST_CAT_009: Edit category with name above maximum length
Then('I should see a validation error about name length', () => {
  CategoriesPage.shouldShowLengthError();
});

// TST_CAT_010: Delete main category successfully
Given('a deletable main category exists', () => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: Cypress.env('adminUsername') || 'admin',
      password: Cypress.env('adminPassword') || 'admin123',
    },
    failOnStatusCode: false,
  }).then((loginRes) => {
    const token = loginRes.body.token;
    // Keep name under 10 chars
    const categoryName = `Del${Math.floor(Math.random() * 9999)}`;
    
    cy.request({
      method: 'POST',
      url: '/api/categories',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: categoryName, parentId: null },
      failOnStatusCode: false,
    }).then((res) => {
      Cypress.env('testCategoryId', res.body.id);
      cy.wrap(categoryName).as('testCategoryName');
    });
  });
  cy.wait(1000);
});

When('I delete the test category', () => {
  cy.get('@testCategoryName').then((categoryName) => {
    // Setup listener for native browser confirm dialog
    cy.on('window:confirm', () => true);
    
    CategoriesPage.clickDeleteForCategory(categoryName);
    
    // Handle confirmation - either custom dialog or native confirm
    CategoriesPage.confirmDelete();
    
    cy.wait(2000); // Wait for deletion to complete
  });
});

Then('the category should not appear in the list', () => {
  cy.get('@testCategoryName').then((categoryName) => {
    cy.goToLastPage();
    CategoriesPage.shouldNotContainCategory(categoryName);
  });
});

// TST_CAT_011: Delete sub-category successfully
Given('a deletable sub-category exists', () => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: Cypress.env('adminUsername') || 'admin',
      password: Cypress.env('adminPassword') || 'admin123',
    },
    failOnStatusCode: false,
  }).then((loginRes) => {
    const token = loginRes.body.token;
    
    // Create parent (under 10 chars)
    cy.request({
      method: 'POST',
      url: '/api/categories',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: `Par${Math.floor(Math.random() * 999)}`, parentId: null },
      failOnStatusCode: false,
    }).then((parentRes) => {
      const parentId = parentRes.body.id;
      Cypress.env('testParentId', parentId);
      
      // Create sub-category (under 10 chars)
      const subName = `DelS${Math.floor(Math.random() * 9999)}`;
      cy.request({
        method: 'POST',
        url: '/api/categories',
        headers: { Authorization: `Bearer ${token}` },
        body: { name: subName, parentId: parentId },
        failOnStatusCode: false,
      }).then((subRes) => {
        Cypress.env('testCategoryId', subRes.body.id);
        cy.wrap(subName).as('testCategoryName');
      });
    });
  });
  cy.wait(1000);
});

// TST_CAT_012: Delete main category with sub-categories
Given('a main category with sub-categories exists', () => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: Cypress.env('adminUsername') || 'admin',
      password: Cypress.env('adminPassword') || 'admin123',
    },
    failOnStatusCode: false,
  }).then((loginRes) => {
    const token = loginRes.body.token;
    // Keep parent name under 10 chars
    const parentName = `ParC${Math.floor(Math.random() * 999)}`;
    
    // Create parent
    cy.request({
      method: 'POST',
      url: '/api/categories',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: parentName, parentId: null },
      failOnStatusCode: false,
    }).then((parentRes) => {
      const parentId = parentRes.body.id;
      Cypress.env('testParentId', parentId);
      cy.wrap(parentName).as('testCategoryName');
      
      // Create child category (under 10 chars)
      cy.request({
        method: 'POST',
        url: '/api/categories',
        headers: { Authorization: `Bearer ${token}` },
        body: { name: `Chi${Math.floor(Math.random() * 9999)}`, parentId: parentId },
        failOnStatusCode: false,
      }).then((childRes) => {
        Cypress.env('testChildId', childRes.body.id);
      });
    });
  });
  cy.wait(1000);
});

When('I attempt to delete the parent category', () => {
  cy.get('@testCategoryName').then((categoryName) => {
    // Setup listener for native browser confirm dialog
    cy.on('window:confirm', () => true);
    
    CategoriesPage.clickDeleteForCategory(categoryName);
    
    // Handle confirmation - either custom dialog or native confirm
    CategoriesPage.confirmDelete();
    
    cy.wait(2000);
  });
});

Then('I should see an error or cascading delete occurs', () => {
  // Check if error message appears OR category is deleted
  cy.get('body').then(($body) => {
    if ($body.find('.alert-danger, .error, [role="alert"]').filter(':visible').length > 0) {
      // Error message shown - deletion prevented
      CategoriesPage.shouldShowErrorMessage();
    } else {
      // No error - cascading delete occurred, verify category is gone
      cy.get('@testCategoryName').then((categoryName) => {
        cy.goToLastPage();
        CategoriesPage.shouldNotContainCategory(categoryName);
      });
    }
  });
});



