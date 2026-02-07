import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// "I am authenticated as {string} via API" is defined in api/AuthSteps.js
// "I send a GET request to {string}" is defined in api/SharedAPISteps.js

// ---- Unauthenticated GET request ----
When("I send an unauthenticated GET request to {string}", (endpoint) => {
  cy.request({
    method: "GET",
    url: endpoint,
    failOnStatusCode: false,
  }).as("apiResponse");
});

// "the response status should be {int}" and "the response status code should be {int}" are in api/SharedAPISteps.js

// ---- Response body not empty ----
Then("the response body should not be empty", function () {
  cy.get("@apiResponse").then((response) => {
    expect(response.body).to.not.be.null;
    expect(response.body).to.not.be.undefined;
    if (Array.isArray(response.body)) {
      expect(response.body).to.be.an("array");
    } else {
      expect(response.body).to.not.be.empty;
    }
  });
});

// ---- Valid JSON check ----
Then("the response should be a valid JSON", function () {
  cy.get("@apiResponse").then((response) => {
    expect(response.body).to.not.be.null;
    expect(response.body).to.not.be.undefined;
    const bodyStr = JSON.stringify(response.body);
    expect(() => JSON.parse(bodyStr)).to.not.throw();
  });
});

// "the response should contain valid JSON data" is defined in api/SharedAPISteps.js

// ---- Store response for later comparison ----
Then("I store the response body as {string}", function (alias) {
  cy.get("@apiResponse").then((response) => {
    cy.wrap(JSON.stringify(response.body)).as(alias);
  });
});

// ---- Wait step ----
When("I wait {int} seconds", (seconds) => {
  cy.wait(seconds * 1000);
});

// ---- Compare response with stored data ----
Then("the response body should match the stored {string}", function (alias) {
  cy.get(`@${alias}`).then((storedData) => {
    cy.get("@apiResponse").then((response) => {
      expect(JSON.stringify(response.body)).to.eq(storedData);
    });
  });
});

// ---- Verify each category has required fields ----
Then(
  "each category in the response should have {string} and {string}",
  function (field1, field2) {
    cy.get("@apiResponse").then((response) => {
      if (Array.isArray(response.body) && response.body.length > 0) {
        response.body.forEach((item) => {
          expect(item).to.have.property(field1);
          expect(item).to.have.property(field2);
        });
      }
    });
  },
);

// ---- Verify each plant has required fields ----
Then(
  "each plant in the response should have {string} and {string} and {string} and {string}",
  function (f1, f2, f3, f4) {
    cy.get("@apiResponse").then((response) => {
      if (Array.isArray(response.body) && response.body.length > 0) {
        response.body.forEach((item) => {
          expect(item).to.have.property(f1);
          expect(item).to.have.property(f2);
          expect(item).to.have.property(f3);
          expect(item).to.have.property(f4);
        });
      }
    });
  },
);

// ---- Verify each sale has required fields ----
Then(
  "each sale in the response should have {string} and {string} and {string}",
  function (f1, f2, f3) {
    cy.get("@apiResponse").then((response) => {
      if (Array.isArray(response.body) && response.body.length > 0) {
        response.body.forEach((item) => {
          expect(item).to.have.property(f1);
          expect(item).to.have.property(f2);
          expect(item).to.have.property(f3);
        });
      }
    });
  },
);
