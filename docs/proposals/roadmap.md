# Roadmap

## Phase 0 — Foundation (current)

- [x] Concept: 4T architecture (Track · Thread · Timeline · Tool)
- [x] Working prototype in Hugo (layouts/skills/list.html, ~450 lines)
- [x] Data: languages track with 9 threads, full timelines, tool snapshots
- [x] Visualization: 4-level drill-down with flip animations, ECharts 5.6
- [x] Architecture decisions documented
- [x] Data schema v1.0 designed
- [x] Repository `four-t` created with docs/proposals

---

## Phase 1 — MVP: widget extraction

**Goal:** a standalone `widget.js` that works without Hugo, driven by `manifest.json` + track files.

### 1.1 Core infrastructure
- [ ] `core/option.js` — Option monad + match helper
- [ ] `core/result.js` — Result monad for fetch errors
- [ ] `core/i18n.js` — resolveField, getString, locale loading
- [ ] `core/scale.js` — periodToMs for all 5 scale types, normalizeTimeline
- [ ] `i18n/en.json`, `i18n/ru.json` — UI strings

### 1.2 Data layer
- [ ] `core/loader.js` — fetch manifest → parallel fetch tracks → LoadedData
- [ ] `4t-data/example/manifest.json` — example data (from competency.json)
- [ ] `4t-data/example/languages.json` — languages track, full data

### 1.3 State and navigation
- [ ] `core/state.js` — immutable state, pure transitions (initState, pushLevel, popTo, setLang)
- [ ] `core/nav.js` — resolveNext, canDrillDown, navigation stack ops

### 1.4 Effects
- [ ] `effects/none.js`
- [ ] `effects/flipX.js` (extracted from prototype)
- [ ] `effects/flipY.js` (extracted from prototype)
- [ ] `effects/grow.js` (extracted from prototype)
- [ ] `effects/registry.js` — applyEffect, registerEffect

### 1.5 Chart builders
- [ ] `charts/L1_tracks.js` — (tracks, config, lang) => EChartsOption
- [ ] `charts/L2_threads.js`
- [ ] `charts/L3_timeline.js` — uses scale.js for time axis
- [ ] `charts/L4_tools.js`

### 1.6 Public API
- [ ] `widget.js` — FourT.init, update, destroy, setLang, registerEffect
- [ ] Dark mode via MutationObserver (extracted from prototype)
- [ ] Resize handler

### 1.7 Demo page
- [ ] `index.html` — minimal static page using the widget with example data
- [ ] Works offline (local ECharts copy) and via CDN

**Deliverable:** `four-t/index.html` renders the full languages track visualization using `4t-data/example/` data. No Hugo required.

---

## Phase 2 — Data completeness

**Goal:** complete example data covering all 5 tracks from the original competency map.

- [ ] `4t-data/example/data-engineering.json`
- [ ] `4t-data/example/infrastructure.json`
- [ ] `4t-data/example/systems.json`
- [ ] `4t-data/example/foundations.json`
- [ ] Update `manifest.json` to list all 5 tracks
- [ ] Both `en` and `ru` strings in all content fields

---

## Phase 3 — 4t-wizard

**Goal:** a working web constructor for building data files, with live widget preview.

### 3.1 Wizard shell
- [ ] `wizard.html` — split-pane layout (widget preview top, editor bottom)
- [ ] `wizard.js` — entry point, panel router, FourT.update integration
- [ ] `store.js` — wizard state + undo stack (10 snapshots)

### 3.2 Controls
- [ ] `controls/slider.js` — level slider bound to scale divisions, shows label on drag
- [ ] `controls/toggle.js` — on/off for optional properties
- [ ] `controls/color-picker.js` — native `<input type="color">` wrapper
- [ ] `controls/effects-picker.js` — dropdown from registry.keys()

### 3.3 Entity panels
- [ ] `panels/tracks.js` — list tracks, add/delete/reorder, edit name/color/effects
- [ ] `panels/threads.js` — list threads in selected track, full CRUD
- [ ] `panels/timeline.js` — table of period/level/annotation rows, add/delete/edit
- [ ] `panels/tools.js` — snapshot management, tool CRUD per snapshot

### 3.4 Scale editor
- [ ] Edit scale divisions: add/remove/rename/reorder
- [ ] Scale preview: slider with live label display

### 3.5 Export
- [ ] `exporter.js` — serialize wizard state to manifest.json + track files
- [ ] "Download ZIP" button
- [ ] "Copy JSON" button per file
- [ ] localStorage autosave + restore on load

### 3.6 Language switcher
- [ ] EN / RU toggle in wizard header
- [ ] Preview widget re-renders in selected language

**Deliverable:** `four-t/wizard.html` — open in browser, build a data set, export files, drop them next to `index.html` and see the widget render.

---

## Phase 4 — Polish and delivery

### 4.1 Schema validation
- [ ] `4t-data/schema/v1.0.json` — JSON Schema
- [ ] Validation on load in dev mode (loader.js)
- [ ] Wizard validates before export

### 4.2 Build tooling
- [ ] `esbuild` config: bundle widget (with and without ECharts)
- [ ] GitHub Actions: on tag → build → create release artifact

### 4.3 CDN
- [ ] First GitHub Release tag `v1.0.0`
- [ ] jsDelivr URL documented in README

### 4.4 Integration example
- [ ] `examples/hugo/` — snippet for Hugo multilingual site
- [ ] `examples/plain-html/` — minimal static page example

---

## Phase 5 — Testing

**Goal:** test suite covering core logic (no DOM testing in phase 5).

- [ ] Unit tests for `core/scale.js` — period parsing for all 5 scale types
- [ ] Unit tests for `core/state.js` — all state transitions
- [ ] Unit tests for `core/nav.js` — resolveNext, canDrillDown, stack ops
- [ ] Unit tests for `core/i18n.js` — resolveField fallback chains
- [ ] Unit tests for `core/option.js`, `core/result.js`
- [ ] Tests for chart builders: given data → expected ECharts series shape
- [ ] Test runner: `node --test` (Node 20 built-in) — no Jest dependency

---

## Phase 6 — Self-hosted demo

**Goal:** deploy the widget and wizard to a dedicated domain served by nginx.

- [ ] Domain delegated and nginx configured
- [ ] `index.html` (full example data) served at root
- [ ] `wizard.html` served at `/wizard`
- [ ] Deploy script or GitHub Actions pipeline

---

## Not in scope (explicitly deferred)

- Animated "story mode" playback (timeline animates forward automatically)
- Sunburst / tree chart type (planned as optional L1 variant in v2)
- User accounts or server-side storage for wizard data
- npm package publication
