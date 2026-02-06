# Test Suite – Running All Tests

This project uses **Cypress + Cucumber** for API and UI tests. Tests are grouped by **module** (plants, categories, sales, auth) and by **type** (API vs UI).

## Prerequisites

1. **App running** at `http://localhost:8080` (see `cypress.config.js`).
2. **Dependencies installed:** `npm install`

## Run the full suite (all modules)

```bash
npm test
```

or:

```bash
npm run test:all
```

This runs every `.feature` file under `cypress/e2e/features/` (API + UI, all modules).

## Run by type or module

| Command | Scope |
|---------|--------|
| `npm run test:all` | All tests |
| `npm run test:api` | All API tests (plants, categories, sales) |
| `npm run test:ui` | All UI tests (auth, plants, categories, sales) |
| `npm run test:plants` | Plants only (UI + API) |
| `npm run test:categories` | Categories only (UI + API) |
| `npm run test:sales` | Sales only (UI + API) |
| `npm run test:auth` | Auth (login) only |
| `npm run test:open` | Open Cypress UI to pick specs |

## Adding a new module

When a teammate adds a new module (e.g. `inventory`):

1. Add feature files under `cypress/e2e/features/` (and optionally `cypress/e2e/features/api/`).
2. Add an npm script in **package.json**, for example:
   ```json
   "test:inventory": "cypress run --spec \"cypress/e2e/features/inventory/**/*.feature\" --spec \"cypress/e2e/features/api/inventory/**/*.feature\""
   ```
3. Document the new script in **cypress/README.md** (Running tests → Test suite table).

## CI

To run the full suite in CI:

```bash
npm ci
npm test
```

To run only API or only UI:

```bash
npm run test:api
# or
npm run test:ui
```

## More detail

- **Cypress config:** `cypress.config.js`
- **Test layout and steps:** `cypress/README.md`
