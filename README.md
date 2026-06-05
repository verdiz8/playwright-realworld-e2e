# Playwright Real-World E2E

[![CI](https://github.com/verdiz8/playwright-realworld-e2e/actions/workflows/ci.yml/badge.svg)](https://github.com/verdiz8/playwright-realworld-e2e/actions/workflows/ci.yml)

**A test architecture demo — not just tests, but *how* to structure them for scale.**

Production-grade Playwright E2E suite against [Sauce Demo](https://www.saucedemo.com). Part of a two-repo SDET portfolio alongside [api-test-framework](https://github.com/verdiz8/api-test-framework).

---

## What this repo proves

| Capability | Why it matters |
|---|---|
| **Page Object Model** | One source of truth per page. Selector changes don't cascade through test files. |
| **Data-driven testing** | Scenarios are typed objects in an array — adding a case means adding data, not code. |
| **Network interception** | `page.route()` for mocking, spying, and error injection. Tests the full request lifecycle. |
| **Custom fixtures** | Extends Playwright's `test` with pre-authenticated state. Demonstrates framework extension. |
| **Cross-browser CI** | Chromium + Firefox matrix with artifact uploads on failure. Trace on first retry. |
| **Decision-documented** | Every architectural choice has a written rationale in [DECISIONS.md](./DECISIONS.md). |

## Structure

```
playwright-realworld-e2e/
├── .github/workflows/ci.yml         ← CI: matrix build, artifact upload, scheduled runs
├── pages/
│   ├── base.page.ts                  ← Shared navigation + wait strategies
│   ├── login.page.ts                 ← Form interaction + error state validation
│   ├── products.page.ts              ← List filtering, sorting, cart management
│   └── checkout.page.ts              ← Multi-step flow + validation errors
├── tests/
│   ├── ui/
│   │   ├── login.spec.ts             ← Data-driven login (success + 3 error variants)
│   │   ├── products.spec.ts          ← Inventory, cart badge, sort ordering
│   │   └── checkout.spec.ts          ← Full flow + missing-field validation
│   └── api/
│       └── products-api.spec.ts      ← Network interception: mock, spy, error injection
├── fixtures/
│   ├── test-data.ts                  ← Typed test inputs (users, scenarios, shipping)
│   └── custom-fixtures.ts            ← Extended Playwright fixtures (pre-auth, debug)
├── playwright.config.ts              ← CI-aware: 2 browsers, retries, trace on failure
├── tsconfig.json                     ← Strict TypeScript — catches data shape errors at build
├── DECISIONS.md                      ← Full architectural decision log (10 decisions)
└── .env.example                      ← Environment variable documentation
```

## Why Sauce Demo?

Sauce Demo is **intentionally flawed** — inconsistent `data-test` attributes, no real API layer, known bugs. A polished demo would let me write cleaner tests. But clean tests against a clean app don't prove anything.

Sauce Demo forces:
- **Defensive locator strategies** — some elements have `data-test`, some don't
- **Explicit waits** — the "performance glitch" user has artificial latency
- **Unexpected states** — the "problem user" sees broken images, the "locked out" user gets an error

This is closer to a real production app than any tutorial target. It's the difference between "I can write Playwright tests" and **"I can test systems that weren't built for testability."**

## Key decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | Sauce Demo as target | Intentionally flawed → forces real-world handling |
| 2 | Page Object Model | Sweet spot between inline selectors (messy at scale) and screenplay (over-engineered) |
| 3 | `for...of` over `test.each` | TypeScript catches mismatched data shapes; parameter names stay explicit |
| 4 | API tests alongside UI | Separate `tests/api/` directory. Fast HTTP validation without duplicating UI coverage |
| 5 | Chromium + Firefox only | WebKit on Linux CI is flaky — diminishing returns |
| 6 | Trace on first retry | Debug data for flaky tests without the perf cost of always-on |
| 7 | Typed fixture data | Compile-time errors for bad data, autocomplete in editor, one source of truth |
| 8 | `page.route()` interception | Mocks at the network layer test the full stack; faster and more reliable than real endpoints |
| 9 | Custom fixtures | DRY auth setup across test files; demonstrates Playwright extension |
| 10 | Strict TypeScript | `noUncheckedIndexedAccess`, `strict: true` — catches undefined paths before they fail at runtime |

Full write-ups with alternatives considered and trade-offs: **[DECISIONS.md](./DECISIONS.md)**

## Run locally

```bash
git clone https://github.com/verdiz8/playwright-realworld-e2e.git
cd playwright-realworld-e2e
npm install
npx playwright install
npm test
```

```bash
npm run test:ui       # interactive UI mode
npm run test:headed   # headed browser
npm run report        # open HTML report
```

## What I'd do at scale

If this were a real 500+ test production suite:

1. **Tag-based test selection** — `@smoke`, `@regression`, `@slow` for targeted CI runs (the config already has the grep pattern)
2. **Shared auth via `storageState`** — authenticate once, reuse state across test files
3. **Visual regression** — Percy/Chromatic for pixel-level change detection alongside functional assertions
4. **Parallel sharding** — split test files across CI runners for sub-2-minute feedback
5. **Seeded test data** — not relying on static demo data that other users can mutate
6. **Slack/webhook reporting** — CI-driven notifications on flaky test detection

None of these belong in this repo — they'd add complexity without adding signal. But the architecture supports every one of them.
