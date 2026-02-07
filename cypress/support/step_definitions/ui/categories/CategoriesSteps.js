import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import CategoriesPage from '../../../../pages/categories/CategoriesPage';

Given('I navigate to categories page', () => {
  // Wait a bit after login to ensure session is established
  cy.wait(1000);
  CategoriesPage.visit();
});

Then('I should see list of categories', () => {
  cy.url().should('include', '/ui/categories');
  cy.contains('Add A Category').should('be.visible');
});

// TC_UI_CAT_ADMIN_01: Add main category with valid data
When('I click the Add Category button', () => {
  CategoriesPage.clickAddCategory();
});

Then('I should be on the Add Category page', () => {
  cy.url().should('include', '/ui/categories/add');
});

When('I enter category name {string}', (name) => {
  // For boundary tests, we need to keep exact length but make it unique
  let categoryName;
  
  if (name === "Abc") {
    // Minimum length boundary test (3 chars) - make unique by appending a single digit
    const randomDigit = Math.floor(Math.random() * 10);
    categoryName = `Ab${randomDigit}`; // Still 3 chars, but unique
  } else if (name === "Abcdefghij") {
    // Maximum length boundary test (10 chars) - generate a unique 10-char name
    const suffix = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    categoryName = `Abcdefg${suffix}`; // 7 + 3 = 10 chars
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
  cy.get('@newCategoryName').then((name) => {
    CategoriesPage.shouldContainCategory(name);
  });
});

// TC_UI_CAT_ADMIN_02: Add sub-category with valid data
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

// TC_UI_CAT_ADMIN_05: Add duplicate category name
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

// TC_UI_CAT_ADMIN_06: Convert sub-category to main category
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

// TC_UI_CAT_ADMIN_07: Edit category name successfully
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
    if (!loginRes.body?.token) {
      throw new Error(`Login failed with status ${loginRes.status}: ${JSON.stringify(loginRes.body)}`);
    }
    const token = loginRes.body.token;
    // Keep name under 10 chars - use timestamp + random for uniqueness
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(Math.random() * 100);
    const categoryName = `E${timestamp}${String(random).padStart(2, '0')}`; // E + 4 digits + 2 digits = 7 chars, unique
    
    cy.request({
      method: 'POST',
      url: '/api/categories',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: categoryName, parentId: null },
      failOnStatusCode: false,
    }).then((res) => {
      if (!res.body?.id) {
        throw new Error(`Category creation failed with status ${res.status}: ${JSON.stringify(res.body)}`);
      }
      Cypress.env('testCategoryId', res.body.id);
      cy.wrap(categoryName).as('originalCategoryName');
      cy.wait(1000);
    });
  });
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

// TC_UI_CAT_ADMIN_08: Edit category with empty name
When('I clear the category name field', () => {
  CategoriesPage.clearCategoryName();
});

Then('I should see a validation error about required name', () => {
  CategoriesPage.shouldShowRequiredError();
});

// TC_UI_CAT_ADMIN_09: Edit category with name above maximum length
Then('I should see a validation error about name length', () => {
  CategoriesPage.shouldShowLengthError();
});

// TC_UI_CAT_ADMIN_10: Delete main category successfully
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

// TC_UI_CAT_ADMIN_11: Delete sub-category successfully
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

// TC_UI_CAT_ADMIN_12: Delete main category with sub-categories
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

// TC_UI_CAT_ADMIN_13: Add category with empty name
// Reuses 'I should see a validation error about required name' from TC_UI_CAT_ADMIN_08

// TC_UI_CAT_ADMIN_14: Cancel add category operation
When('I click Cancel on the category form', () => {
  CategoriesPage.clickCancel();
  cy.wait(1000);
});

// TC_UI_CAT_ADMIN_15: Add category with name less than 3 characters
// Uses existing 'I should see a validation error about name length' step

// TC_UI_CAT_ADMIN_16: Add category with name more than 10 characters
// Uses existing 'I should see a validation error about name length' step

// TC_UI_CAT_ADMIN_17: Convert main category to sub-category
Given('a main category exists for conversion', () => {
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
    const categoryName = `Main${Math.floor(Math.random() * 9999)}`;
    
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

Given('another main category exists as parent', () => {
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
    const parentName = `Par${Math.floor(Math.random() * 9999)}`;
    
    cy.request({
      method: 'POST',
      url: '/api/categories',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: parentName, parentId: null },
      failOnStatusCode: false,
    }).then((res) => {
      Cypress.env('testParentId', res.body.id);
      cy.wrap(parentName).as('testParentName');
    });
  });
  cy.wait(1000);
});

When('I navigate to edit the conversion category', () => {
  const categoryId = Cypress.env('testCategoryId');
  CategoriesPage.visitEditCategory(categoryId);
});

When('I change parent to the available parent category', () => {
  const parentId = Cypress.env('testParentId');
  CategoriesPage.selectParentCategory(String(parentId));
});

Then('the category should be a sub-category', () => {
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
      expect(res.body.parentId).to.not.be.null;
      expect(res.body.parentId).to.equal(Cypress.env('testParentId'));
    });
  });
});

// TC_UI_CAT_ADMIN_18: Edit category parent successfully
Given('a sub-category with a parent exists', () => {
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
    
    // Create first parent
    cy.request({
      method: 'POST',
      url: '/api/categories',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: `Par${Math.floor(Math.random() * 999)}`, parentId: null },
      failOnStatusCode: false,
    }).then((parentRes) => {
      const parentId = parentRes.body.id;
      Cypress.env('testOriginalParentId', parentId);
      
      // Create sub-category under first parent
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

Given('another main category exists as alternate parent', () => {
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
    const altParentName = `Alt${Math.floor(Math.random() * 9999)}`;
    
    cy.request({
      method: 'POST',
      url: '/api/categories',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: altParentName, parentId: null },
      failOnStatusCode: false,
    }).then((res) => {
      Cypress.env('testAltParentId', res.body.id);
      cy.wrap(altParentName).as('testAltParentName');
    });
  });
  cy.wait(1000);
});

When('I navigate to edit the sub-category', () => {
  const categoryId = Cypress.env('testCategoryId');
  CategoriesPage.visitEditCategory(categoryId);
});

When('I change parent to the alternate parent category', () => {
  const altParentId = Cypress.env('testAltParentId');
  CategoriesPage.selectParentCategory(String(altParentId));
});

Then('the category should have the new parent', () => {
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
      expect(res.body.parentId).to.equal(Cypress.env('testAltParentId'));
    });
  });
});

// TC_UI_CAT_ADMIN_19: Edit category name below minimum length
// Uses existing steps: 'a category exists for editing', 'I navigate to edit that category',
// 'I update category name to', and 'I should see a validation error about name length'



