class LoginPage {
    elements = {
      usernameInput: () => cy.get('#username'),
      passwordInput: () => cy.get('#password'),
      loginButton: () => cy.get('button[type="submit"]')
    }
  
    visit() {
      cy.visit('/login');
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