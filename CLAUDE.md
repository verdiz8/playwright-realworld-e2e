# CLAUDE.md — playwright-realworld-e2e

Production-grade Playwright E2E suite against [Sauce Demo](https://www.saucedemo.com). This is one of two public automation repos built for the SDET-first portfolio at [verdigris](https://github.com/verdiz8).

## What this repo proves

- Page Object Model architecture
- Data-driven testing (typed fixtures, not hardcoded values)
- Cross-browser CI (Chromium + Firefox via GitHub Actions)
- API-level validation alongside UI tests
- Decision-documented test strategy (DECISIONS.md)

## Commands

```bash
npm install
npx playwright install        # first time only
npm test                       # run all tests
npm run test:ui                # interactive UI mode
npm run test:headed            # headed browser
npm run report                 # open HTML report
```

## Structure

```
pages/              ← Page objects (BasePage, LoginPage, ProductsPage, CheckoutPage)
tests/ui/           ← UI test specs (login, products, checkout)
tests/api/          ← API-level tests (products-api)
fixtures/           ← Typed test data factories (users, login scenarios, shipping)
playwright.config.ts ← CI-ready config (2 browsers, trace on retry, screenshot on fail)
.github/workflows/  ← CI pipeline (Chromium + Firefox matrix, artifact upload on failure)
```

## Architecture decisions (see DECISIONS.md for full rationale)

1. **Sauce Demo as target** — intentionally flawed app forces defensive locators and real-world handling. Better than a polished demo.
2. **Page Object Model** — sweet spot between inline selectors (messy at scale) and screenplay pattern (over-engineered here).
3. **Data-driven via typed fixtures** — `for...of` over typed arrays beats `test.each` (loses types) and JSON files (no compile checks).
4. **API tests in same project** — separate `tests/api/` directory. Sauce Demo has no real API, but the pattern is what matters.
5. **Two browsers in CI** — Chromium + Firefox. WebKit on Linux CI is flaky; diminishing returns.

## Where to extend

If this were a real 500+ test suite (from DECISIONS.md):
- Tag-based test selection (`@smoke`, `@regression`, `@slow`)
- Visual regression with Percy/Chromatic
- Shared auth state via `storageState`
- Parallel workers per shard
- Test data seeded per run

## Quick orientation

| File | Purpose |
|---|---|
| `pages/base.page.ts` | Base page class — `goto()`, `waitForApp()`, shared by all |
| `pages/login.page.ts` | Login form interactions + error state validation |
| `pages/products.page.ts` | Inventory list, sorting, add-to-cart |
| `pages/checkout.page.ts` | Multi-step checkout flow |
| `fixtures/test-data.ts` | All test inputs — users, login scenarios, shipping info |
| `tests/ui/login.spec.ts` | Data-driven login tests (success + error cases) |
| `tests/ui/products.spec.ts` | Product list, cart badge, sorting |
| `tests/ui/checkout.spec.ts` | Full checkout flow + validation error |
| `tests/api/products-api.spec.ts` | HTTP-level assertions (auth redirects, response structure) |
| `playwright.config.ts` | 2 browsers, retries in CI, trace on failure |
| `DECISIONS.md` | Full decision log — the differentiator for recruiters |
