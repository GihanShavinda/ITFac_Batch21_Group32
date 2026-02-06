// cypress/pages/LoginPage.js
class LoginPage {
    // Selectors matching login form (name="username", name="password", submit button)
    elements = {
      usernameInput: () => cy.get('input[name="username"]'),
      passwordInput: () => cy.get('input[name="password"]'),
      loginButton: () => cy.get('button[type="submit"]'),
    }
  
    visit() {
      cy.visit('/ui/login');
    }
  
    enterUsername(username) {
      this.elements.usernameInput().type(username);
    }
  
    enterPassword(password) {
      this.elements.passwordInput().type(password);
    }
  
    clickLogin() {
      this.elements.loginButton().click();
    }
  }
  
  export default new LoginPage();