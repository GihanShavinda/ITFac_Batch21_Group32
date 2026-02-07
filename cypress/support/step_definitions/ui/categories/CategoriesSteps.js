import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import CategoriesPage from '../../../../pages/categories/CategoriesPage';

Given('I navigate to categories page', () => {
  cy.wait(1000);
  CategoriesPage.visit();
});

Then('I should see list of categories', () => {
  cy.url().should('include', '/ui/categories');
  cy.contains('Add A Category').should('be.visible');
});

When('I click the Add Category button', () => {
  CategoriesPage.clickAddCategory();
});

Then('I should be on the Add Category page', () => {
  cy.url().should('include', '/ui/categories/add');
});

When('I enter category name {string}', (name) => {
  let categoryName;
  if (name === "Abc") {
    const randomDigit = Math.floor(Math.random() * 10);
    categoryName = `Ab${randomDigit}`;
  } else if (name === "Abcdefghij") {
    const suffix = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    categoryName = `Abcdefg${suffix}`;
  } else {
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

Given('at least one main category exists', () => {
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
      cy.request({
        method: 'GET',
        url: '/api/categories',
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then((listRes) => {
        if (listRes.status === 200) {
          const body = listRes.body;
          const list = Array.isArray(body) ? body : body?.content ?? body?.data ?? [];
          if (list.length === 0) {
            const parentCategoryName = `TestParent-${Date.now()}`;
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
            Cypress.env('testParentCategoryName', null);
          }
        }
      });
    }
  });
  
  cy.wait(1000);
});

When('I select the first parent category', () => {
  CategoriesPage.selectParentCategory('first');
});

Given('a category {string} already exists', (categoryName) => {
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
    
    cy.request({
      method: 'POST',
      url: '/api/categories',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: `Par${Math.floor(Math.random() * 999)}`, parentId: null },
      failOnStatusCode: false,
    }).then((parentRes) => {
      const parentId = parentRes.body.id;
      Cypress.env('testParentId', parentId);
      
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

When('I clear the category name field', () => {
  CategoriesPage.clearCategoryName();
});

Then('I should see a validation error about required name', () => {
  CategoriesPage.shouldShowRequiredError();
});

Then('I should see a validation error about name length', () => {
  CategoriesPage.shouldShowLengthError();
});

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
    cy.on('window:confirm', () => true);
    
    CategoriesPage.clickDeleteForCategory(categoryName);
    
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
    
    cy.request({
      method: 'POST',
      url: '/api/categories',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: `Par${Math.floor(Math.random() * 999)}`, parentId: null },
      failOnStatusCode: false,
    }).then((parentRes) => {
      const parentId = parentRes.body.id;
      Cypress.env('testParentId', parentId);
      
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
    const parentName = `ParC${Math.floor(Math.random() * 999)}`;
    
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
    cy.on('window:confirm', () => true);
    
    CategoriesPage.clickDeleteForCategory(categoryName);
    
    CategoriesPage.confirmDelete();
    
    cy.wait(2000);
  });
});

Then('I should see an error or cascading delete occurs', () => {
  cy.get('body').then(($body) => {
    if ($body.find('.alert-danger, .error, [role="alert"]').filter(':visible').length > 0) {
      CategoriesPage.shouldShowErrorMessage();
    } else {
      cy.get('@testCategoryName').then((categoryName) => {
        cy.goToLastPage();
        CategoriesPage.shouldNotContainCategory(categoryName);
      });
    }
  });
});


When('I click Cancel on the category form', () => {
  CategoriesPage.clickCancel();
  cy.wait(1000);
});



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
    
    cy.request({
      method: 'POST',
      url: '/api/categories',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: `Par${Math.floor(Math.random() * 999)}`, parentId: null },
      failOnStatusCode: false,
    }).then((parentRes) => {
      const parentId = parentRes.body.id;
      Cypress.env('testOriginalParentId', parentId);
      
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




