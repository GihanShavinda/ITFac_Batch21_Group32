class SalesPage {
    visit() {
      cy.visit('/sales');
    }
  }
  export default new SalesPage();