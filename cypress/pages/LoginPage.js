class LoginPage {
  // Selectors matching your login form (name="username", name="password", submit button)
  elements = {
    usernameInput: () => cy.get('input[name="username"]'),
    passwordInput: () => cy.get('input[name="password"]'),
    loginButton: () => cy.get('button[type="submit"]'),
  };

  visit() {
    cy.visit("/ui/login");
  }

  enterUsername(username) {
    this.elements.usernameInput().clear().type(username);
  }

  enterPassword(password) {
    this.elements.passwordInput().clear().type(password);
  }

  clickLogin() {
    this.elements.loginButton().click();
  }
}

export default new LoginPage();
