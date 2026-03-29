# Issue #7: Phase 5 — Testing Infrastructure

**Type:** Feature
**Status:** Planned
**Epic:** #1

---

## Objective

Establish a unit testing infrastructure for the `4t-widget` core modules. Tests run
in an isolated Docker container — no artifacts, no global Node.js install required
on the developer machine or CI runner.

---

## Design Decisions

### D1: Vitest as test runner

**Decision:** Use [Vitest](https://vitest.dev/) as the test framework.

**Rationale:** The project uses ES modules throughout (`type: module`). Vitest has
first-class ESM support without configuration workarounds. Jest requires additional
setup (`jest-environment-jsdom`, transform config) and has known friction with native
ESM — as seen in the `info-tech-io/quiz` reference project, which migrated from Jest
to Vitest for this reason.

**Note:** The "no dependencies" principle applies to the product code (`4t-widget`,
`4t-wizard`). Dev infrastructure (test runner, coverage tool) is not subject to this
constraint — the same way `4t-wizard` uses Vue 3 from CDN without it being a
product-code dependency.

**Packages:**
```json
{
  "devDependencies": {
    "vitest": "^3.x",
    "@vitest/coverage-v8": "^3.x"
  }
}
```

### D2: Tests run in Docker — no host pollution

**Decision:** All test execution happens inside the `test` service defined in
`docker-compose.yml` (see Issue #8 Stage 3). The `node_modules` directory and
coverage reports are never written to the repository working tree on the host.

**Rationale:** Keeps the repository clean. The widget and wizard have no build step
and no `package.json` by design — adding `node_modules` to the repo root would
contradict the project's zero-dependency-on-host philosophy.

**How to run locally:**
```bash
docker compose --profile test run --rm test
```

**In CI (GitHub Actions):** runs automatically as the `test` job before deploy
(see `.github/workflows/deploy.yml`).

### D3: Test scope — widget core modules

**Decision:** Tests cover pure functions in `4t-widget/`:

| Module | What to test |
|--------|-------------|
| `loader.js` | manifest parsing, track loading, error paths |
| `state.js` | navigation stack: push, pop, reset, boundary conditions |
| `effects.js` | effect resolution, unknown effect handling |
| `chart-builders.js` | series generation from track/thread/timeline data |
| `option.js` / `result.js` | monad laws: map, flatMap, unwrap |

The wizard (`4t-wizard/`) and demo page (`index.html`) are not unit tested — they
are integration/E2E targets for a future phase.

### D4: Test file placement

**Decision:** Test files live alongside source files: `4t-widget/loader.test.js`,
`4t-widget/state.test.js`, etc.

**Rationale:** Co-location makes it obvious which tests cover which module. Vitest
discovers `*.test.js` files automatically with zero configuration.

### D5: Coverage reporting

**Decision:** Coverage via `@vitest/coverage-v8`. Report written inside the container
only — not persisted to the host. CI prints the summary to stdout; no HTML report
artifact is uploaded.

**Rationale:** Coverage HTML artifacts in CI are rarely consulted. A summary in the
job log is sufficient for this stage. If coverage tracking becomes important, a
dedicated phase (or GitHub Pages upload) can be added.

---

## `vitest.config.js`

```js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['4t-widget/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['4t-widget/**/*.js'],
      exclude: ['4t-widget/**/*.test.js'],
    },
  },
})
```

---

## Stages

| # | Title | Status |
|---|-------|--------|
| 1 | Write tests for core widget modules | Planned |
| 2 | Verify CI pipeline (test job gates deploy) | Planned |
