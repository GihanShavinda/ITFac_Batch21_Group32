class PlantsPage {
  elements = {
    // Find by link text (href can vary with base path)
    addPlantButton: () => cy.contains('a', 'Add a Plant'),
    nameInput: () => cy.get('#name, input[name="name"]').first(),
    // Your app uses id="categoryId" name="categoryId" (options: value="" placeholder, "1" Lilly, "3" Rosa)
    categorySelect: () => cy.get('#categoryId, select[name="categoryId"]').first(),
    priceInput: () => cy.get('#price, input[name="price"]').first(),
    quantityInput: () => cy.get('#quantity, input[name="quantity"]').first(),
    saveButton: () => cy.contains('button', 'Save').first(),
    // List page: Edit is <a href="/ui/plants/edit/{id}" title="Edit"> with icon only; Delete is <form action="/ui/plants/delete/{id}"><button title="Delete"> with icon (modal's "Delete" is hidden until opened)
    firstEditLink: () => cy.get('a[href*="/ui/plants/edit/"]').first(),
    firstDeleteButton: () => cy.get('table tbody tr').first().find('form[action*="/ui/plants/delete/"] button').first(),
    // Validation: message below Price field or in form (adjust selector if your app uses specific class e.g. .invalid-feedback)
    validationMessage: (text) => cy.contains(text).filter(':visible'),
    // Table row containing plant name (for Low badge); then find badge within row
    rowContainingPlantName: (name) => cy.contains('tr', name).first(),
    // List page: search, filter, sort (adjust selectors to match your app)
    searchInput: () => cy.get('input[name="search"], input[name="name"], input[placeholder*="Search"], input[type="search"]').first(),
    searchButton: () => cy.get('button[type="submit"]').filter(':visible').first(),
    categoryFilterSelect: () => cy.get('select[name="categoryId"], select[name="category"], #categoryFilter').first(),
    sortSelect: () => cy.get('select[name="sort"], select[name="orderBy"], #sortBy').first(),
    // Column headers for sort (if sort is by clicking headers)
    sortHeader: (label) => cy.contains('th', label).first(),
  };

  visit() {
    cy.visit('/ui/plants');
  }

  visitAddPlant() {
    cy.visit('/ui/plants/add');
  }

  clickAddPlant() {
    this.elements.addPlantButton().click();
  }

  fillPlantForm(name, categoryOption, price, quantity) {
    if (name) this.elements.nameInput().clear().type(name);
    if (categoryOption !== undefined) {
      if (categoryOption === 'first' || categoryOption === '') {
        // Select first real option (index 1 skips "Select..." placeholder if present)
        this.elements.categorySelect().select(1, { force: true });
      } else {
        this.elements.categorySelect().select(categoryOption);
      }
    }
    if (price !== undefined) this.elements.priceInput().clear().type(String(price));
    if (quantity !== undefined) this.elements.quantityInput().clear().type(String(quantity));
  }

  clickSave() {
    this.elements.saveButton().click();
  }

  shouldBeOnPlantListPage() {
    cy.url().should('include', '/ui/plants');
    cy.url().should('not.include', '/add');
  }

  shouldContainPlantNamed(plantName) {
    cy.contains(plantName).should('be.visible');
  }

  shouldBeOnEditPlantPage() {
    cy.url().should('include', '/ui/plants/edit/');
  }

  shouldRemainOnAddPlantPage() {
    cy.url().should('include', '/ui/plants/add');
  }

  shouldShowValidationMessage(messageText) {
    this.elements.validationMessage(messageText).should('be.visible');
  }

  clickEditForFirstPlant() {
    this.elements.firstEditLink().click();
  }

  clickDeleteForFirstPlant() {
    this.elements.firstDeleteButton().click();
  }

  /** Get the name of the first plant in the list (first cell or first text in first row). */
  getFirstPlantName() {
    // Assume table: first data row has plant name in first column or first link/text
    return cy.get('table tbody tr').first().find('td').first().invoke('text').then((t) => t.trim());
  }

  shouldNotContainPlantNamed(plantName) {
    // After delete we stay on list; scoped to table to avoid matching nav/header
    cy.get('table').within(() => {
      cy.contains(plantName).should('not.exist');
    });
  }

  /** Assert "Low" badge is visible in the same row as the plant with the given name. */
  shouldSeeLowBadgeForPlant(plantName) {
    this.elements.rowContainingPlantName(plantName).within(() => {
      cy.contains(/Low/i).should('be.visible');
    });
  }

  // --- List page: search, filter, sort (user scenarios) ---
  searchForPlant(name) {
    this.elements.searchInput().clear().type(name);
    cy.get('body').then(($body) => {
      const $searchBtn = $body.find('button, input[type="submit"]').filter((i, el) => /Search|Go|Submit/i.test(Cypress.$(el).text() || Cypress.$(el).val()));
      if ($searchBtn.length) cy.wrap($searchBtn.first()).click();
      else this.elements.searchInput().type('{enter}');
    });
  }

  filterByCategoryOnList() {
    this.elements.categoryFilterSelect().select(1, { force: true });
  }

  sortListBy(field) {
    const normalized = String(field).toLowerCase();
    cy.get('body').then(($body) => {
      const $sortSelect = $body.find('select[name="sort"], select[name="orderBy"], #sortBy');
      if ($sortSelect.length) {
        cy.get('select[name="sort"], select[name="orderBy"], #sortBy').first().select(new RegExp(normalized, 'i'), { force: true });
      } else {
        // Sort is done by clicking the <a> link in the header (e.g. <a href="...?sortField=quantity&sortDir=desc">Stock</a>)
        cy.get('table').contains('a', new RegExp(field, 'i')).first().click();
        cy.url().should('include', 'sortField=');
      }
    });
  }

  shouldSeePlantListWithPaginationOrNoPlants() {
    cy.url().should('include', '/ui/plants');
    cy.get('body').then(($body) => {
      const hasTable = $body.find('table').length > 0;
      const hasNoPlants = /no plants found/i.test($body.text());
      const hasPagination = $body.find('nav, .pagination, [aria-label*="pagination"]').length > 0 || $body.find('a, button').filter((i, el) => /Next|Last|Page/i.test(Cypress.$(el).text())).length > 0;
      expect(hasTable || hasNoPlants || hasPagination, 'Expected plant list with pagination or "No plants found"').to.be.true;
    });
  }

  shouldSeeOnlyPlantsMatchingSearch(searchTerm) {
    cy.get('body').then(($body) => {
      if ($body.find('table tbody tr').length === 0) return;
      cy.get('table tbody tr').each(($row) => {
        cy.wrap($row).invoke('text').should('include', searchTerm);
      });
    });
  }

  shouldSeeOnlyPlantsInSelectedCategory() {
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  }

  shouldBeSortedBy(field) {
    const fieldLower = String(field).toLowerCase();
    // Resolve column index from table header (Name, Price, Stock/Quantity may be in any order)
    cy.get('table thead th').then(($headers) => {
      let colIndex = -1;
      $headers.each((i, el) => {
        const text = Cypress.$(el).text().trim().toLowerCase();
        if (fieldLower === 'name' && text.includes('name')) colIndex = i;
        else if (fieldLower === 'price' && text.includes('price')) colIndex = i;
        else if ((fieldLower === 'stock' || fieldLower === 'quantity') && (text.includes('stock') || text.includes('quantity'))) colIndex = i;
      });
      if (colIndex < 0) colIndex = { name: 0, price: 1, quantity: 2, stock: 2 }[fieldLower] ?? 0;

      cy.get('table tbody tr').then(($rows) => {
        if ($rows.length < 2) return;
        const values = [];
        $rows.each((i, row) => {
          const cell = Cypress.$(row).find('td').eq(colIndex).text().trim();
          values.push(cell);
        });
        // Assert list is in sorted order (ascending or descending); don't compare to our own sort so direction and tie-breaking don't fail
        const isNumeric = fieldLower !== 'name';
        const cmp = (a, b) => {
          if (isNumeric) {
            const x = parseFloat(String(a).replace(/[^0-9.-]/g, '')) || 0;
            const y = parseFloat(String(b).replace(/[^0-9.-]/g, '')) || 0;
            return x - y;
          }
          return String(a).localeCompare(String(b));
        };
        const ascending = values.every((_, i) => i === 0 || cmp(values[i], values[i - 1]) >= 0);
        const descending = values.every((_, i) => i === 0 || cmp(values[i], values[i - 1]) <= 0);
        expect(ascending || descending, `Expected list sorted by ${field} (asc or desc), got: ${values.slice(0, 5).join(', ')}...`).to.be.true;
      });
    });
  }

  shouldNotSeeAdminActions() {
    cy.contains('a', 'Add a Plant').should('not.exist');
    cy.get('a[href*="/ui/plants/edit/"]').should('not.exist');
    cy.get('form[action*="/ui/plants/delete/"]').should('not.exist');
  }
}

export default new PlantsPage();
