# Technical Requirements

## TR-1: Runtime environment

- **TR-1.1** The widget runs in any modern browser (ES2020+): Chrome 88+, Firefox 85+, Safari 14+, Edge 88+.
- **TR-1.2** No build step is required to use the widget. A build step is optional for bundling ECharts.
- **TR-1.3** The widget has one required external dependency: **Apache ECharts 5.6.x**. ECharts may be loaded via CDN, bundled into the widget, or provided by the host page.
- **TR-1.4** No other runtime dependencies. No React, Vue, Angular, or utility libraries.

---

## TR-2: Code style and patterns

- **TR-2.1** The codebase is written in **vanilla ES2020 JavaScript** (modules, optional chaining, nullish coalescing, `Promise.all`).
- **TR-2.2** The dominant style is **functional**: pure functions, immutable data, function composition. Side effects are isolated at module boundaries.
- **TR-2.3** Data structures are **flat**. Deeply nested property chains are avoided; prefer destructuring and explicit intermediate variables.
- **TR-2.4** Null-safety is handled via a minimal **Option monad** (`Some` / `None`) implemented in `core/option.js`. Functions that may return no result return an `Option`, not `null`.
- **TR-2.5** Where branching on type/tag is needed, a **`match`** helper is used instead of `if/else` chains.
- **TR-2.6** Each module exports named functions. No classes. No `this`.

---

## TR-3: Module system

- **TR-3.1** The codebase uses **ES modules** (`import` / `export`).
- **TR-3.2** Each logical concern lives in its own file. No file exceeds ~150 lines; if it does, it is split.
- **TR-3.3** The public API of the widget is a single named export from `widget.js`:
  ```js
  export const FourT = { init, update, destroy, setLang }
  ```
- **TR-3.4** Chart option builders (`charts/L*.js`) are pure functions with signature:
  ```js
  (data: TrackData | ThreadData | ..., config: ChartConfig) => EChartsOption
  ```
- **TR-3.5** The effect registry (`effects/registry.js`) maps effect names to functions with signature:
  ```js
  (chartDom: HTMLElement, callback: () => void) => void
  ```

---

## TR-4: State management

- **TR-4.1** Widget state is a single immutable object. Each navigation action produces a new state; the previous state is not mutated.
- **TR-4.2** State shape:
  ```js
  {
    stack:   Array<{ type: EntityType, id: string | null, meta: object }>,
    lang:    string,
    data:    LoadedData,
    config:  WidgetConfig
  }
  ```
- **TR-4.3** State transitions are pure functions: `(state, action) => state`.
- **TR-4.4** The navigation stack supports back-navigation to any depth.

---

## TR-5: Data loading

- **TR-5.1** The widget loads `manifest.json` first, then fetches all track files listed in `tracks[]` in parallel via `Promise.all`.
- **TR-5.2** All fetch errors are represented as `Result` (Ok / Err). The widget renders an error state when data fails to load; it does not throw.
- **TR-5.3** Data is validated against the JSON Schema on load in development mode. In production, validation is skipped for performance.
- **TR-5.4** The `"4t"` version field is checked on load. Incompatible versions log a warning.

---

## TR-6: i18n

- **TR-6.1** UI strings are loaded from `4t-widget/i18n/{lang}.json` at init time.
- **TR-6.2** Content strings (names, annotations) are resolved by the `resolveField(field, lang)` function which accepts both plain strings and `{ en: ..., ru: ... }` objects.
- **TR-6.3** Missing translation keys fall back to `"en"`. Missing `"en"` values fall back to the raw key.
- **TR-6.4** Language switching does not re-fetch data; it re-renders from cached data with the new `lang` in state.

---

## TR-7: Time scale

- **TR-7.1** Supported scales: `day`, `week`, `month`, `quarter`, `year`.
- **TR-7.2** Period strings follow the pattern matching their scale:
  - `quarter`: `"2023Q1"` — `"2023Q4"`
  - `year`: `"2023"`
  - `month`: `"2023-01"` — `"2023-12"`
  - `week`: `"2023-W01"` — `"2023-W52"`
  - `day`: `"2023-01-15"` (ISO 8601)
- **TR-7.3** All period strings are converted to milliseconds via pure functions in `core/scale.js` for use as ECharts time-axis values.
- **TR-7.4** Supported interpolation modes: `step`, `linear`, `smooth`.
- **TR-7.5** Supported edge handling modes: `zero`, `extend`, `null`.

---

## TR-8: Effects

- **TR-8.1** Each effect is a self-contained module exporting a single function.
- **TR-8.2** The `none` effect is the no-op default: `(dom, cb) => cb()`.
- **TR-8.3** Effects must not leave residual CSS transforms on the chart DOM element after completion.
- **TR-8.4** New effects can be registered at runtime: `FourT.registerEffect(name, fn)`.

---

## TR-9: Build and delivery

- **TR-9.1** The development setup requires only Node.js for optional bundling (esbuild or rollup). No webpack, no Vite mandatory.
- **TR-9.2** The bundled artifact is a single `widget.js` file, optionally including ECharts.
- **TR-9.3** A GitHub Actions workflow creates a release on tag push and publishes the artifact, making it available via jsDelivr.
- **TR-9.4** The wizard is a self-contained static HTML page with no build step required.

---

## TR-10: Schema versioning

- **TR-10.1** Every data file (`manifest.json`, track files) carries a `"4t": "1.0"` field.
- **TR-10.2** The schema version follows semantic versioning: minor bumps are backward-compatible, major bumps are not.
- **TR-10.3** The JSON Schema for each version is stored in `4t-data/schema/v{major}.{minor}.json`.
