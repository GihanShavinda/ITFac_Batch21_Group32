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
}

export default new PlantsPage();
