// cypress/support/testDataHelper.js

export const generateUniqueCategory = () => {
  const timestamp = Date.now().toString().slice(-5);
  return `Cat${timestamp}`;
};

export const generateUniquePlant = () => {
  const timestamp = Date.now().toString().slice(-5);
  return `Plt${timestamp}`;
};

export const createTestDataWithSubCategory = (token) => {
  const mainCatName = generateUniqueCategory();
  const subCatName = `Sub${Date.now().toString().slice(-5)}`;
  const plantName = generateUniquePlant();

  // Create main category, then sub-category, then plant
  return cy.request({
    method: 'POST',
    url: '/api/categories',
    headers: { Authorization: `Bearer ${token}` },
    body: { name: mainCatName, parentId: null },
    failOnStatusCode: false
  }).then((mainCatRes) => {
    return cy.request({
      method: 'POST',
      url: '/api/categories',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: subCatName, parentId: mainCatRes.body.id },
      failOnStatusCode: false
    }).then((subCatRes) => {
      return cy.request({
        method: 'POST',
        url: `/api/plants/category/${subCatRes.body.id}`,
        headers: { Authorization: `Bearer ${token}` },
        body: { name: plantName, price: 50, quantity: 100 },
        failOnStatusCode: false
      }).then((plantRes) => {
        return {
          mainCategory: mainCatRes.body,
          subCategory: subCatRes.body,
          plant: plantRes.body
        };
      });
    });
  });
};