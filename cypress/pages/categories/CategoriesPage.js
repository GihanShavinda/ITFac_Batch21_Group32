class CategoriesPage {
    visit() {
      cy.visit('/categories');
    }
  }
  export default new CategoriesPage();