class PlantsPage {
    visit() {
      cy.visit('/plants');
    }
  }
  export default new PlantsPage();