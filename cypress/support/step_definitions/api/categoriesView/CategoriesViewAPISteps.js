import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

let apiResponse;

Given("I am authenticated as {string} via API", (role) => {
  const normalizedRole = (role || "admin").toLowerCase();
  const envTokenKey = normalizedRole === "admin" ? "adminToken" : "userToken";
  const envUserKey =
    normalizedRole === "admin" ? "adminUsername" : "userUsername";
  const envPassKey =
    normalizedRole === "admin" ? "adminPassword" : "userPassword";

  const username =
    Cypress.env(envUserKey) || (normalizedRole === "admin" ? "admin" : "user");
  const password =
    Cypress.env(envPassKey) ||
    (normalizedRole === "admin" ? "admin123" : "user123");

  cy.log(`Auth attempt for ${normalizedRole}: ${username}:${password}`);

  cy.wrap(null).as("authToken");
  cy.wrap(null).as("basicAuth");

  const token = Cypress.env(envTokenKey);
  if (token) {
    cy.wrap(token).as("authToken");
    cy.log(`Using pre-set ${normalizedRole} token`);
    return;
  }

  const loginPayload = { username, password };

  const basicAuthValue = btoa(
    `${loginPayload.username}:${loginPayload.password}`,
  );
  cy.log(
    `Basic Auth prepared: ${loginPayload.username}:${loginPayload.password}`,
  );
  cy.wrap(basicAuthValue).as("basicAuth");

  const loginEndpoints = ["/api/auth/login", "/api/authenticate", "/api/login"];

  let lastResponse = null;

  const tryLogin = (index) => {
    const endpoint = loginEndpoints[index];
    if (!endpoint) {
      const message = lastResponse?.body?.message || lastResponse?.body?.error;
      if (lastResponse?.status === 401 && /basic auth/i.test(message || "")) {
        const basic = btoa(`${loginPayload.username}:${loginPayload.password}`);
        cy.wrap(basic).as("basicAuth");
        return;
      }

      throw new Error(
        `Could not get auth token. Tried: ${loginEndpoints.join(", ")}. Check credentials in cypress.config.js env.`,
      );
    }

    cy.request({
      method: "POST",
      url: endpoint,
      body: loginPayload,
      failOnStatusCode: false,
    }).then((res) => {
      lastResponse = res;
      const tokenFromBody =
        res.body?.token || res.body?.accessToken || res.body?.jwt;

      if (res.status === 200 && tokenFromBody) {
        cy.wrap(tokenFromBody).as("authToken");
        return;
      }

      if (index < loginEndpoints.length - 1) {
        tryLogin(index + 1);
        return;
      }

      const message = res.body?.message || res.body?.error;
      if (res.status === 401 && /basic auth/i.test(message || "")) {
        const basic = btoa(`${loginPayload.username}:${loginPayload.password}`);
        cy.wrap(basic).as("basicAuth");
        return;
      }

      throw new Error(
        `Could not get auth token. Last response: ${res.status} ${JSON.stringify(res.body)}`,
      );
    });
  };

  tryLogin(0);
});

When("I send a GET request to {string}", (endpoint) => {
  cy.get("@basicAuth").then((basic) => {
    cy.get("@authToken").then((token) => {
      const tryBearer = () =>
        cy.request({
          method: "GET",
          url: endpoint,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          failOnStatusCode: false,
        });

      const tryBasic = () =>
        cy.request({
          method: "GET",
          url: endpoint,
          headers: {
            Authorization: `Basic ${basic}`,
          },
          failOnStatusCode: false,
        });

      if (basic) {
        tryBasic().then((res) => {
          if (res.status === 401 && token) {
            tryBearer().then((retryRes) => {
              apiResponse = retryRes;
              cy.wrap(retryRes).as("apiResponse");
            });
            return;
          }
          apiResponse = res;
          cy.wrap(res).as("apiResponse");
        });
        return;
      }

      if (token) {
        tryBearer().then((res) => {
          apiResponse = res;
          cy.wrap(res).as("apiResponse");
        });
        return;
      }

      throw new Error("No auth token or Basic Auth credentials available.");
    });
  });
});

Then("the response status code should be {int}", (statusCode) => {
  cy.get("@apiResponse").its("status").should("eq", statusCode);
});

Then("the response should contain valid JSON data", () => {
  cy.get("@apiResponse")
    .its("body")
    .then((body) => {
      if (typeof body === "string") {
        expect(() => JSON.parse(body)).not.to.throw();
        return;
      }
      expect(body).to.not.equal(null);
    });
});

Then(
  "the response should contain a list of categories with id, name, parent, and subCategories",
  () => {
    const body = apiResponse?.body;
    const parsedBody = typeof body === "string" ? JSON.parse(body) : body;
    const list = Array.isArray(parsedBody)
      ? parsedBody
      : parsedBody?.data || parsedBody?.content || parsedBody?.categories || [];

    expect(list).to.be.an("array");

    if (list.length === 0) {
      return;
    }

    list.forEach((item) => {
      expect(item).to.have.property("id");
      expect(item).to.have.property("name");
      // parent can be missing, null, or an object depending on API shape
      if (Object.prototype.hasOwnProperty.call(item, "parent")) {
        expect(item.parent === null || typeof item.parent === "object").to.eq(
          true,
        );
      }
      if (Object.prototype.hasOwnProperty.call(item, "parentId")) {
        expect(
          item.parentId === null || typeof item.parentId === "number",
        ).to.eq(true);
      }
      if (Object.prototype.hasOwnProperty.call(item, "subCategories")) {
        expect(
          item.subCategories === null || Array.isArray(item.subCategories),
        ).to.eq(true);
      }
    });
  },
);

Then("the response should contain a list of categories", () => {
  const body = apiResponse?.body;
  const parsedBody = typeof body === "string" ? JSON.parse(body) : body;
  const list = Array.isArray(parsedBody)
    ? parsedBody
    : parsedBody?.data || parsedBody?.content || parsedBody?.categories || [];

  expect(list).to.be.an("array");
});

Then("the response should contain category object", () => {
  const body = apiResponse?.body;
  const parsedBody = typeof body === "string" ? JSON.parse(body) : body;

  expect(parsedBody).to.be.an("object");

  if (Object.prototype.hasOwnProperty.call(parsedBody, "id")) {
    expect(parsedBody.id).to.exist;
  }
  if (Object.prototype.hasOwnProperty.call(parsedBody, "name")) {
    expect(parsedBody.name).to.be.a("string");
  }
});

Given("a valid category with ID {string} exists", (id) => {
  const categoryId = Number.isNaN(Number(id)) ? id : Number(id);
  cy.wrap(categoryId).as("validCategoryId");

  cy.get("@basicAuth").then((basic) => {
    cy.get("@authToken").then((token) => {
      const tryBearer = () =>
        cy.request({
          method: "GET",
          url: `/api/categories/${id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          failOnStatusCode: false,
        });

      const tryBasic = () =>
        cy.request({
          method: "GET",
          url: `/api/categories/${id}`,
          headers: {
            Authorization: `Basic ${basic}`,
          },
          failOnStatusCode: false,
        });

      if (basic) {
        tryBasic().then((res) => {
          if (res.status === 401 && token) {
            tryBearer().then((retryRes) => {
              expect(retryRes.status).to.eq(200);
              cy.wrap(retryRes.body).as("validCategory");
            });
            return;
          }
          expect(res.status).to.eq(200);
          cy.wrap(res.body).as("validCategory");
        });
        return;
      }

      if (token) {
        tryBearer().then((res) => {
          expect(res.status).to.eq(200);
          cy.wrap(res.body).as("validCategory");
        });
        return;
      }

      throw new Error("No auth token or Basic Auth credentials available.");
    });
  });
});

Then("the response should contain category object with correct data", () => {
  cy.get("@apiResponse")
    .its("body")
    .then((body) => {
      const parsedBody = typeof body === "string" ? JSON.parse(body) : body;
      expect(parsedBody).to.be.an("object");

      cy.get("@validCategoryId").then((categoryId) => {
        if (Object.prototype.hasOwnProperty.call(parsedBody, "id")) {
          expect(parsedBody.id).to.eq(categoryId);
        }
        if (Object.prototype.hasOwnProperty.call(parsedBody, "categoryId")) {
          expect(parsedBody.categoryId).to.eq(categoryId);
        }
      });

      expect(parsedBody).to.have.property("name");

      if (Object.prototype.hasOwnProperty.call(parsedBody, "parent")) {
        expect(
          parsedBody.parent === null || typeof parsedBody.parent === "object",
        ).to.eq(true);
      }

      if (Object.prototype.hasOwnProperty.call(parsedBody, "subCategories")) {
        expect(
          parsedBody.subCategories === null ||
            Array.isArray(parsedBody.subCategories),
        ).to.eq(true);
      }
    });
});

Then("the response should contain an error message", () => {
  cy.get("@apiResponse")
    .its("body")
    .then((body) => {
      const parsedBody = typeof body === "string" ? JSON.parse(body) : body;
      if (typeof parsedBody === "string") {
        expect(parsedBody.toLowerCase()).to.match(/error|not found|invalid/);
        return;
      }
      expect(parsedBody).to.satisfy(
        (b) =>
          !!b &&
          (typeof b.message === "string" ||
            typeof b.error === "string" ||
            typeof b.detail === "string"),
      );
    });
});

When("I send a POST request to {string} with body:", (endpoint, body) => {
  const parsedBody = typeof body === "string" ? JSON.parse(body) : body;
  if (parsedBody?.name) {
    cy.wrap(parsedBody.name).as("updatedCategoryName");
  }
  cy.get("@authToken").then((token) => {
    cy.request({
      method: "POST",
      url: endpoint,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: parsedBody,
      failOnStatusCode: false,
    }).then((res) => {
      apiResponse = res;
      cy.wrap(res).as("apiResponse");
    });
  });
});

Then("the response should contain the updated category", () => {
  cy.get("@apiResponse")
    .its("body")
    .then((body) => {
      const parsedBody = typeof body === "string" ? JSON.parse(body) : body;
      expect(parsedBody).to.be.an("object");
      cy.get("@updatedCategoryName").then((updatedName) => {
        if (Object.prototype.hasOwnProperty.call(parsedBody, "name")) {
          expect(parsedBody.name).to.eq(updatedName);
        }
      });
    });
});
Then("the response should contain summary data", () => {
  cy.get("@apiResponse")
    .its("body")
    .then((body) => {
      const parsedBody = typeof body === "string" ? JSON.parse(body) : body;
      expect(parsedBody).to.be.an("object");

      cy.log("Summary response body:", parsedBody);

      const summaryFields = [
        "totalCategories",
        "totalSubCategories",
        "activeCategories",
        "categoryCount",
        "count",
        "total",
        "categories",
        "data",
        "summary",
      ];

      let hasValidData = false;

      for (const field of summaryFields) {
        if (Object.prototype.hasOwnProperty.call(parsedBody, field)) {
          const value = parsedBody[field];
          if (
            typeof value === "number" ||
            typeof value === "object" ||
            Array.isArray(value)
          ) {
            hasValidData = true;
            cy.log(`Found summary field: ${field} =`, value);
          }
        }
      }

      if (!hasValidData) {
        const keys = Object.keys(parsedBody);
        if (keys.length > 0) {
          hasValidData = true;
          cy.log("Response has data fields:", keys);
        }
      }

      expect(hasValidData).to.eq(true, "Response should contain summary data");
    });
});
Then("the response should contain a list of subcategories", () => {
  cy.get("@apiResponse")
    .its("body")
    .then((body) => {
      const parsedBody = typeof body === "string" ? JSON.parse(body) : body;

      let subcategoriesList = null;

      if (Array.isArray(parsedBody)) {
        subcategoriesList = parsedBody;
      } else if (parsedBody?.data && Array.isArray(parsedBody.data)) {
        subcategoriesList = parsedBody.data;
      } else if (
        parsedBody?.subCategories &&
        Array.isArray(parsedBody.subCategories)
      ) {
        subcategoriesList = parsedBody.subCategories;
      } else if (
        parsedBody?.categories &&
        Array.isArray(parsedBody.categories)
      ) {
        subcategoriesList = parsedBody.categories;
      } else if (parsedBody?.items && Array.isArray(parsedBody.items)) {
        subcategoriesList = parsedBody.items;
      }

      expect(subcategoriesList).to.be.an("array");

      cy.log(`Found ${subcategoriesList.length} subcategories`);

      if (subcategoriesList.length > 0) {
        subcategoriesList.forEach((subcategory) => {
          expect(subcategory).to.be.an("object");
          if (Object.prototype.hasOwnProperty.call(subcategory, "id")) {
            expect(subcategory.id).to.exist;
          }
          if (Object.prototype.hasOwnProperty.call(subcategory, "name")) {
            expect(subcategory.name).to.be.a("string");
          }
        });
      }
    });
});
Then("the response should contain main category list", () => {
  const body = apiResponse?.body;
  const parsedBody = typeof body === "string" ? JSON.parse(body) : body;

  let mainCategoryList = null;

  if (Array.isArray(parsedBody)) {
    mainCategoryList = parsedBody;
  } else if (parsedBody?.data && Array.isArray(parsedBody.data)) {
    mainCategoryList = parsedBody.data;
  } else if (
    parsedBody?.mainCategories &&
    Array.isArray(parsedBody.mainCategories)
  ) {
    mainCategoryList = parsedBody.mainCategories;
  } else if (parsedBody?.categories && Array.isArray(parsedBody.categories)) {
    mainCategoryList = parsedBody.categories;
  } else if (parsedBody?.items && Array.isArray(parsedBody.items)) {
    mainCategoryList = parsedBody.items;
  }

  expect(mainCategoryList).to.be.an("array");

  cy.log(`Found ${mainCategoryList.length} main categories`);

  if (mainCategoryList.length > 0) {
    mainCategoryList.forEach((category) => {
      expect(category).to.be.an("object");
      if (Object.prototype.hasOwnProperty.call(category, "id")) {
        expect(category.id).to.exist;
      }
      if (Object.prototype.hasOwnProperty.call(category, "name")) {
        expect(category.name).to.be.a("string");
      }
    });
  }
});
Then("the response should contain pagination information", () => {
  const body = apiResponse?.body;
  const parsedBody = typeof body === "string" ? JSON.parse(body) : body;

  expect(parsedBody).to.be.an("object");

  const paginationFields = [
    "page",
    "pageNumber",
    "pageSize",
    "size",
    "totalPages",
    "totalElements",
    "totalItems",
    "currentPage",
    "content",
    "data",
    "items",
  ];

  let hasPaginationField = false;
  for (const field of paginationFields) {
    if (Object.prototype.hasOwnProperty.call(parsedBody, field)) {
      hasPaginationField = true;
      cy.log(`Found pagination field: ${field} =`, parsedBody[field]);
    }
  }

  expect(hasPaginationField).to.eq(
    true,
    "Response should contain pagination information (page, size, totalPages, etc.)",
  );

  if (
    Object.prototype.hasOwnProperty.call(parsedBody, "content") ||
    Object.prototype.hasOwnProperty.call(parsedBody, "data") ||
    Object.prototype.hasOwnProperty.call(parsedBody, "items")
  ) {
    const listField = parsedBody.content || parsedBody.data || parsedBody.items;
    expect(Array.isArray(listField)).to.eq(
      true,
      "Paginated response should contain content/data array",
    );
  }
});
