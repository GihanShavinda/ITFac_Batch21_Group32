class SalesPage {
  elements = {
    pageTitle: () => cy.contains('h1', 'Sales'),
    sellPlantButton: () => cy.contains('button', 'Sell Plant'),
    salesTable: () => cy.get('table'),
    tableHeaders: () => cy.get('table thead th'),
    tableRows: () => cy.get('table tbody tr'),
    deleteButtons: () => cy.get('[data-action="delete"]'),
    pagination: () => cy.get('.pagination'),
    alertSuccess: () => cy.get('.alert-success'),
    alertDanger: () => cy.get('.alert-danger'),
    noSalesMessage: () => cy.contains('No sales found'),
    plantDropdown: () => cy.get('select[name="plantId"]'),
    quantityInput: () => cy.get('input[name="quantity"]'),
    sellButton: () => cy.contains('button', 'Sell'),
    cancelButton: () => cy.contains('button', 'Cancel'),
  };

  visit() {
    cy.visit('/ui/sales');
  }

  visitSellPlant() {
    cy.visit('/ui/sales/new');
  }

  clickSellPlant() {
    this.elements.sellPlantButton().click();
  }

  selectPlant(plantOption) {
    this.elements.plantDropdown().select(plantOption);
  }

  enterQuantity(quantity) {
    this.elements.quantityInput().clear().type(String(quantity));
  }

  clickSell() {
    this.elements.sellButton().click();
  }

  clickDeleteForSale(plantName) {
    cy.contains('tr', plantName).find('[data-action="delete"]').click();
  }

  confirmDeletion() {
    cy.on('window:confirm', () => true);
  }

  verifyPageTitle(title) {
    this.elements.pageTitle().should('be.visible').and('contain', title);
  }

  verifySellPlantButtonVisible() {
    this.elements.sellPlantButton().should('be.visible');
  }

  verifySellPlantButtonNotVisible() {
    this.elements.sellPlantButton().should('not.exist');
  }

  verifyTableColumns(columns) {
    columns.forEach(column => {
      this.elements.tableHeaders().should('contain', column);
    });
  }

  verifyActionsColumnNotVisible() {
    this.elements.tableHeaders().should('not.contain', 'Actions');
  }

  verifyPaginationVisible() {
    this.elements.pagination().should('be.visible');
  }

  verifySuccessMessage(message) {
    this.elements.alertSuccess().should('contain', message);
  }

  verifySaleInList(plantName) {
    this.elements.tableRows().should('contain', plantName);
  }

  verifySaleNotInList(plantName) {
    this.elements.tableRows().should('not.contain', plantName);
  }

  verifyNoSalesMessage() {
    this.elements.noSalesMessage().should('be.visible');
  }

  clickColumnHeader(columnName) {
    this.elements.tableHeaders().contains(columnName).click();
  }
}

export default new SalesPage();