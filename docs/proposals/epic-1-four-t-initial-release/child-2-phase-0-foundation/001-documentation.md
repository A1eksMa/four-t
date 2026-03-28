# Stage 1: Documentation

**Objective:** Create complete architecture, schema, requirements, and example data
**Duration:** 1 session (retrospective)
**Dependencies:** None

---

## Steps

### Step 1.1: Repository creation and initial structure

**Action:** Create `four-t` repository with module directories and `.gitignore`

**Deliverables:**
- `four-t/` git repository
- `4t-widget/`, `4t-wizard/`, `4t-data/example/`, `docs/proposals/` directories
- `.gitignore`

**Success criteria:** Repository initialised, directories present, first commit pushed

---

### Step 1.2: Functional and technical requirements

**Action:** Write FR-1–FR-5 and TR-1–TR-10 covering all system requirements

**Deliverables:**
- `docs/proposals/functional-requirements.md`
- `docs/proposals/technical-requirements.md`

**Success criteria:** All discussed requirements captured; code style (functional, Option/Result, flat structures) explicit in TR-2

---

### Step 1.3: Architecture and data schema

**Action:** Document module structure, internal types, render loop, data schema

**Deliverables:**
- `docs/proposals/architecture.md`
  - Core module sketches (option, result, state, nav, i18n, scale)
  - Internal types: `LoadedData`, `TrackData`, `ThreadData`, `NavigationFrame`, `Instance`
  - Widget render loop with full control flow
  - Design decision rationale
- `docs/proposals/data-schema.md`
  - `manifest.json` schema with field reference table
  - Track file schema with Thread, TimelineConfig, ChartMeta, ToolSnapshot
  - Type definitions: LocaleString, EntityType, effect names

**Success criteria:** Every module has a defined input/output contract; `LoadedData` type fully specified

---

### Step 1.4: Example data

**Action:** Convert `data/competency.json` from A1eksMa.github.io to four-t schema

**Deliverables:**
- `4t-data/example/manifest.json` — global config, 10-level scale, widget entry
- `4t-data/example/languages.json` — 9 threads (Python, Java, Rust, PHP, FoxPro, Kotlin, Go, JS, C++), full timelines, tool snapshots
- `4t-data/example/data.json`, `infra.json`, `systems.json`, `foundations.json` — placeholders

**Success criteria:** `languages.json` validates against schema; all fields use LocaleString (en + ru)

---

### Step 1.5: Roadmap

**Action:** Document 6-phase implementation plan with deliverables

**Deliverables:**
- `docs/proposals/roadmap.md`

**Success criteria:** Each phase has a clear deliverable statement

---

## Definition of Done

- All files committed to `main`
- Architecture reviewed and Phase 1 blockers resolved (LoadedData types, scale.js scope, render loop)
- No open questions that block Phase 1 implementation
