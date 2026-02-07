# Copilot Instructions - Group32 BugHunters Test Suite

## Project Overview
Cypress E2E test automation for a plant nursery management system with role-based access control (admin, user, sales manager). Tests validate Categories, Plants, and Sales features via both UI and API.

## Architecture & Organization

### BDD Structure (Cucumber + Cypress)
- **Feature files**: `cypress/e2e/features/**/*.feature` - API under `features/api/`, UI under `features/ui/`
- **Step definitions**: `cypress/support/step_definitions/` - API under `api/`, UI under `ui/`
- **Page Objects**: `cypress/pages/` - element locators + actions + assertions combined

### Test Separation Pattern
Each feature has **both UI and API test files** with role-specific variants:
- `admin-{feature}-ui.feature` / `admin-{feature}-api.feature` - Admin operations
- `user-{feature}-ui.feature` / `user-{feature}-api.feature` - User access control tests

Example: `categories/` contains 5 feature files covering admin CRUD (UI+API), user security (UI+API), and shared scenarios.

## Critical Conventions

### Page Object Model (Non-Standard)
Page objects use a **three-part structure** (see [CategoriesPage.js](cypress/pages/categories/CategoriesPage.js)):
```javascript
class Page {
  elements = { /* locators as functions */ }  // 1. Locators
  // Actions  // 2. Interaction methods
  // Assertions  // 3. Verification methods
}
export default new Page(); // Singleton export
```
**Why**: Combines selectors, actions, AND assertions in one class instead of separating concerns.

### Authentication Patterns
Two login approaches exist side-by-side:
1. **UI Login**: `cy.loginAsAdmin()` / `cy.loginAsUser()` (custom commands)
2. **API Token**: `cy.getAdminToken()` for API tests
3. **Inline login** in step definitions (e.g., [LoginSteps.js](cypress/support/step_definitions/ui/auth/LoginSteps.js) lines 23-28)

**Important**: Use custom commands from [commands.js](cypress/support/commands.js) for new tests, but existing step definitions have inline implementations.

### API Testing Strategy
API steps use **shared state variables** at module level:
```javascript
let authToken;
let apiResponse;
let categoryId;
```
See [CategoriesAPISteps.js](cypress/support/step_definitions/api/categories/CategoriesAPISteps.js) - responses stored in `apiResponse` for assertion chaining.

### Environment Configuration
Credentials in `cypress.config.js` env block (lines 26-31):
- `adminUsername`, `adminPassword`
- `userUsername`, `userPassword`
- **baseUrl**: `http://localhost:8080` (requires running app)

### Tagging Strategy
Feature files use multi-level tags for test filtering:
- **Role tags**: `@admin`, `@user`, `@sales`
- **Test type**: `@ui`, `@api`
- **Outcome**: `@positive`, `@negative`, `@security`
- **Priority**: `@smoke`

Example: `@admin @api @negative` for admin API error scenarios.

## Development Workflows

### Running Tests
```bash
# All tests
npx cypress open

# Specific feature
npx cypress run --spec "cypress/e2e/features/ui/categories/admin-categories-ui.feature"

# By tags (requires plugin configuration)
npx cypress run --env tags="@admin and @api"
```

### Adding New Tests
1. Create feature file with role prefix: `{role}-{feature}-{type}.feature`
2. Add step definitions in `step_definitions/api/{feature}/` or `step_definitions/ui/{feature}/` matching feature organization
3. Create/extend page object in `pages/{feature}/`
4. Use existing custom commands from [commands.js](cypress/support/commands.js)
5. Follow test ID pattern: `TST-{FEATURE}-{NUMBER}` in scenario names

### Naming Patterns
- **Feature files**: Kebab-case with role prefix (`admin-categories-api.feature`)
- **Page objects**: PascalCase + "Page" suffix (`CategoriesPage.js`)
- **Step files**: Match feature + "Steps.js" (`categoriesAPISteps.js`)
- **Custom commands**: camelCase with action prefix (`loginAsAdmin`, `createCategoryAPI`)

## Key Files Reference

- [cypress.config.js](cypress.config.js) - Cucumber preprocessor setup, base URL, credentials
- [cypress/support/commands.js](cypress/support/commands.js) - Reusable login/API commands
- [cypress/support/e2e.js](cypress/support/e2e.js) - Global configuration, uncaught exception handler
- [cypress/pages/categories/CategoriesPage.js](cypress/pages/categories/CategoriesPage.js) - Example of page object pattern

## Common Pitfalls

1. **Don't create separate assertion files** - assertions live in page objects
2. **Module-level state in API steps** - variables reset per feature file run
3. **baseUrl is hardcoded** - requires backend running on port 8080
4. **Mixed login approaches** - check existing step definitions before adding new login logic
5. **Screenshots auto-capture** on failure to `cypress/screenshots/{feature}/`
