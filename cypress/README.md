# Cypress + Cucumber – Test Structure

This folder contains **API** and **UI** tests using Cypress and Cucumber (Gherkin).

## Folder structure

| Path | Purpose |
|------|--------|
| **e2e/features/** | Gherkin `.feature` files (scenarios). |
| **e2e/features/api/** | API test features, grouped by domain (same as UI). |
| **e2e/features/api/plants/** | Plants API features (e.g. `PlantsAPI.feature`). |
| **e2e/features/api/sales/** | Sales API features (e.g. `SalesAPI.feature`). |
| **e2e/features/api/categories/** | Categories API features (e.g. `CategoriesAPI.feature`). |
| **e2e/features/auth/** | Auth-related UI features (e.g. `Login.feature`). |
| **e2e/features/plants/** | UI features for plants. |
| **e2e/features/categories/** | UI features for categories. |
| **e2e/features/sales/** | UI features for sales. |
| **support/step_definitions/** | Step definitions (implementation of Given/When/Then). |
| **support/step_definitions/api/** | Shared API steps: **AuthSteps.js** (“I am authenticated as admin for API”). |
| **support/step_definitions/api/plants/** | Plants API steps and **PlantsAPIHooks.js** (Before/After cleanup). |
| **support/step_definitions/api/sales/** | Sales API steps. |
| **support/step_definitions/api/categories/** | Categories API steps. |
| **support/step_definitions/plants/** | Plants UI steps and **PlantsHooks.js** (After cleanup for add-plant scenario). |
| **support/step_definitions/LoginSteps.js** | Shared UI login steps (“I am logged in as admin”, etc.). |
| **pages/** | UI page objects (selectors and actions). API tests use `cy.request()` in steps, no page objects. |
| **fixtures/ui/** | Test data for UI tests (e.g. `cy.fixture('ui/testData')`). |
| **fixtures/api/** | Test data for API tests (e.g. `cy.fixture('api/testData')`). |

## Shared steps (reuse across features)

- **UI login:** `Given I am logged in as admin` or `Given I am logged in as sales manager`  
  → Implemented in **support/step_definitions/LoginSteps.js**
- **API auth:** `Given I am authenticated as admin for API`  
  → Implemented in **support/step_definitions/api/AuthSteps.js**  
  → If `adminToken` is not set in **cypress.env.json** or **cypress.config.js**, the step calls `POST /api/auth/login` to get a fresh JWT. Do **not** paste an expired token into `adminToken`; leave it unset or empty so each run gets a new token and avoids 401 errors.

Use these step texts in any feature file; do not duplicate the implementation.

## Test data cleanup (Before/After hooks)

**Best practice:** Avoid filling the database with test data by cleaning up in **After** hooks. When a scenario creates a resource via API (e.g. a plant), an **After** hook should delete that resource so the next run starts from a clean state.

- **Plants API:** Scenarios tagged `@TC_API_PLT_ADMIN_01` (API) use **Before** to set a dummy `createPlantResponse` and **After** to call `DELETE /api/plants/{id}` for the created plant. See **support/step_definitions/api/plants/PlantsAPIHooks.js**. If your API uses a different DELETE path, update the `url` in the After hook.
- **Plants UI:** The “Add plant with valid data” scenario is also tagged `@TC_UI_PLT_ADMIN_01`. An **After** hook in **support/step_definitions/plants/PlantsHooks.js** logs in via API, lists plants (GET /api/plants), finds the one matching `@newPlantName`, and deletes it. If your API uses a different list path (e.g. by category) or pagination, adjust the GET url or add a search param in PlantsHooks.js.
- **Cucumber limitation:** With `@badeball/cypress-cucumber-preprocessor`, **After() does not run when the scenario fails.** So cleanup runs only on success. For cleanup even on failure, you can use Cypress `afterEach()` in **cypress/support/e2e.js** (e.g. check for an alias and delete if present).

## Running tests

Ensure the app is running at `baseUrl` (see **cypress.config.js**).

### Test suite (from project root)

Use **npm scripts** so the whole team runs the same commands:

| Command | What it runs |
|--------|----------------|
| `npm test` or `npm run test:all` | **All** feature files (API + UI, all modules) |
| `npm run test:open` | Cypress interactive runner (all specs) |
| `npm run test:api` | **API only** (auth, plants, categories, sales APIs) |
| `npm run test:ui` | **UI only** (auth, plants, categories, sales – no API features) |
| `npm run test:plants` | **Plants** (UI plants + API plants) |
| `npm run test:categories` | **Categories** (UI + API) |
| `npm run test:sales` | **Sales** (UI + API) |
| `npm run test:auth` | **Auth** (login UI) |

When new modules are added (e.g. `inventory`), add a matching script in **package.json** and document it here.

### Direct Cypress commands

- All: `npx cypress run` or `npx cypress open`
- One folder: `npx cypress run --spec "cypress/e2e/features/api/plants/**/*.feature"`
- One file: `npx cypress run --spec "cypress/e2e/features/auth/Login.feature"`
- dfdddddddd
