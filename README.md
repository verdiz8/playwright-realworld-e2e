# Playwright Real-World E2E

Production-grade end-to-end test suite against [Sauce Demo](https://www.saucedemo.com) — the standard public ecommerce app for test automation demos.

## What this proves

- **Page Object Model** — clean separation of selectors from test logic
- **Data-driven testing** — scenarios defined as data, tests iterate over them
- **Cross-browser** — Chromium + Firefox in CI
- **CI integration** — GitHub Actions with artifact uploads on failure
- **API + UI testing** — not just clicking buttons; validating data at every layer

## Structure

```
pages/          ← Page objects (login, products, checkout)
tests/ui/       ← UI test specs
tests/api/      ← API-level tests
fixtures/       ← Test data factories
```

## Run locally

```bash
npm install
npx playwright install
npm test
```

## Why Sauce Demo?

Sauce Demo is intentionally flawed — it has known bugs, inconsistent selectors, and no real API. That makes it a *better* test target than a polished app: it rewards defensive locator strategies, forces explicit waits, and surfaces the kind of real-world fragility that clean demos hide.

## Key decisions

See [DECISIONS.md](./DECISIONS.md) for the reasoning behind every major test design choice.
