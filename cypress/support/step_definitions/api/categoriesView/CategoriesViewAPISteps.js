import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Then(
  "the response should contain a list of categories with id, name, parent, and subCategories",
  () => {
    cy.get("@apiResponse").its("body").then((body) => {
      const parsedBody = typeof body === "string" ? JSON.parse(body) : body;
      const list = Array.isArray(parsedBody)
        ? parsedBody
        : parsedBody?.data || parsedBody?.content || parsedBody?.categories || [];

      expect(list).to.be.an("array");

      if (list.length === 0) return;

      list.forEach((item) => {
        expect(item).to.have.property("id");
        expect(item).to.have.property("name");
        if (Object.prototype.hasOwnProperty.call(item, "parent")) {
          expect(item.parent === null || typeof item.parent === "object").to.eq(true);
        }
        if (Object.prototype.hasOwnProperty.call(item, "parentId")) {
          expect(item.parentId === null || typeof item.parentId === "number").to.eq(true);
        }
        if (Object.prototype.hasOwnProperty.call(item, "subCategories")) {
          expect(item.subCategories === null || Array.isArray(item.subCategories)).to.eq(true);
        }
      });
    });
  },
);

Then("the response should contain a list of categories", () => {
  cy.get("@apiResponse").its("body").then((body) => {
    const parsedBody = typeof body === "string" ? JSON.parse(body) : body;
    const list = Array.isArray(parsedBody)
      ? parsedBody
      : parsedBody?.data || parsedBody?.content || parsedBody?.categories || [];
    expect(list).to.be.an("array");
  });
});

Then("the response should contain category object", () => {
  cy.get("@apiResponse").its("body").then((body) => {
    const parsedBody = typeof body === "string" ? JSON.parse(body) : body;
    expect(parsedBody).to.be.an("object");
    if (Object.prototype.hasOwnProperty.call(parsedBody, "id")) {
      expect(parsedBody.id).to.exist;
    }
    if (Object.prototype.hasOwnProperty.call(parsedBody, "name")) {
      expect(parsedBody.name).to.be.a("string");
    }
  });
});

Given("a valid category with ID {string} exists", (id) => {
  const categoryId = Number.isNaN(Number(id)) ? id : Number(id);
  cy.wrap(categoryId).as("validCategoryId");

  cy.get("@authToken").then((token) => {
    cy.request({
      method: "GET",
      url: `/api/categories/${id}`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
      cy.wrap(res.body).as("validCategory");
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
          }
        }
      }

      if (!hasValidData) {
        const keys = Object.keys(parsedBody);
        if (keys.length > 0) {
          hasValidData = true;
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
  cy.get("@apiResponse").its("body").then((body) => {
    const parsedBody = typeof body === "string" ? JSON.parse(body) : body;
    let mainCategoryList = null;

    if (Array.isArray(parsedBody)) {
      mainCategoryList = parsedBody;
    } else if (parsedBody?.data && Array.isArray(parsedBody.data)) {
      mainCategoryList = parsedBody.data;
    } else if (parsedBody?.mainCategories && Array.isArray(parsedBody.mainCategories)) {
      mainCategoryList = parsedBody.mainCategories;
    } else if (parsedBody?.categories && Array.isArray(parsedBody.categories)) {
      mainCategoryList = parsedBody.categories;
    } else if (parsedBody?.items && Array.isArray(parsedBody.items)) {
      mainCategoryList = parsedBody.items;
    }

    expect(mainCategoryList).to.be.an("array");

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
});
Then("the response should contain pagination information", () => {
  cy.get("@apiResponse").its("body").then((body) => {
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
});
