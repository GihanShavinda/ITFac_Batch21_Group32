import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("I send an unauthenticated GET request to {string}", (endpoint) => {
  cy.request({
    method: "GET",
    url: endpoint,
    failOnStatusCode: false,
  }).as("apiResponse");
});

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

Then("the response should be a valid JSON", function () {
  cy.get("@apiResponse").then((response) => {
    expect(response.body).to.not.be.null;
    expect(response.body).to.not.be.undefined;
    const bodyStr = JSON.stringify(response.body);
    expect(() => JSON.parse(bodyStr)).to.not.throw();
  });
});

Then("I store the response body as {string}", function (alias) {
  cy.get("@apiResponse").then((response) => {
    cy.wrap(JSON.stringify(response.body)).as(alias);
  });
});

When("I wait {int} seconds", (seconds) => {
  cy.wait(seconds * 1000);
});

Then("the response body should match the stored {string}", function (alias) {
  cy.get(`@${alias}`).then((storedData) => {
    cy.get("@apiResponse").then((response) => {
      expect(JSON.stringify(response.body)).to.eq(storedData);
    });
  });
});

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
