# Decisions

Why this test suite looks the way it does. Each entry documents a deliberate choice — what I did, what I considered, why I chose this path.

---

## 1. Target: Sauce Demo, not a perfect demo app

**Options considered:**
- Build a custom Next.js app to test against
- Use a polished public demo (e.g. DemoQA, The Internet)
- Use Sauce Demo

**Chosen: Sauce Demo.**

Sauce Demo is deliberately flawed — inconsistent `data-test` attributes, no real API layer, mixed selector strategies. A polished demo would let me write cleaner tests. But clean tests against a clean app don't prove anything. Sauce Demo forces:

- Defensive locator strategies (some elements have `data-test`, some don't)
- Explicit waits where the app is slow
- Handling unexpected states (the "problem user" sees broken images)

This is closer to a real production app than any tutorial target. It's the difference between "I can write Playwright tests" and "I can test systems that weren't built for testability."

---

## 2. Page Object Model, not screenplay or inline selectors

**Options considered:**
- Inline selectors directly in test files
- Page Object Model
- Screenplay pattern

**Chosen: Page Object Model.**

Inline selectors are fine for 5 tests and a maintenance nightmare at 50. Screenplay pattern is elegant but over-engineered for this scope — it adds abstraction layers that make the repo harder to onboard.

POM hits the sweet spot: one source of truth per page, easy to update selectors when the app changes, readable test code. A senior SDET should default to POM and know when to reach for more.

---

## 3. Data-driven tests via fixture arrays, not test.each

**Options considered:**
- Duplicate test blocks per scenario
- `test.each` table syntax
- Iterating over fixture data with `for...of`

**Chosen: Iterating over typed fixture arrays.**

`test.each` is concise but loses type safety and makes parameter names implicit. The `for...of` pattern with typed interfaces means:
- TypeScript catches mismatched data shapes
- Test names are dynamic and descriptive
- Adding a scenario is adding an object to an array — no test code changes

---

## 4. API tests live alongside UI tests, not in a separate project

**Options considered:**
- Separate `api-tests/` package
- Same project, different directory
- Skip API tests (Sauce Demo has no real API)

**Chosen: Same project, `tests/api/` directory.**

Sauce Demo has no real REST API — the "API tests" validate HTTP-level behaviour (auth redirects, response structure). In a real project I'd point these at actual endpoints. The point is the pattern: API tests are faster and more stable than UI tests for data validation. Use them for what they're good at, don't duplicate UI test coverage at the HTTP layer.

---

## 5. Two browsers in CI, not all three

**Options considered:**
- Chromium only
- Chromium + Firefox + WebKit
- Chromium + Firefox

**Chosen: Chromium + Firefox.**

WebKit on Linux CI is flaky and adds maintenance cost disproportionate to the coverage gain. Chromium catches most issues. Firefox adds a second rendering engine for confidence. Three browsers would slow CI without meaningfully improving defect detection — diminishing returns.

---

## 6. Trace on first retry, not always-on

**Options considered:**
- Always capture traces
- Never capture traces
- On first retry

**Chosen: On first retry.**

Traces are large and slow down test execution. Always-on traces would double CI time for no benefit on passing tests. On-retry gives me the debugging data I need for flaky tests without paying the cost on every run.

---

## 7. Test data in typed fixtures, not inline or .json files

**Options considered:**
- Hardcoded strings in test files
- `.json` data files
- Typed TypeScript fixtures

**Chosen: Typed TypeScript fixtures.**

JSON files have no type checking — a typo in a username field surfaces at runtime. Inline strings scatter data across test files, making it hard to audit what's being tested. Typed fixtures mean: autocomplete in the editor, compile-time errors for bad data, one place to update credentials when the test target changes.

---

## What I'd do differently at scale

If this were a real production suite with 500+ tests:

1. **Tag-based test selection** — `@smoke`, `@regression`, `@slow` tags for selective CI runs
2. **Visual regression with Percy/Chromatic** — not just functional assertions, pixel-level change detection
3. **Shared auth state** — `storageState` to avoid re-logging-in across test files
4. **Parallel workers per shard** — split test files across CI runners for sub-2-minute feedback
5. **Test data seeded per run** — not relying on static demo data that other people can mutate

None of those belong in this repo yet — they'd add complexity without adding signal. But the architecture supports them.
