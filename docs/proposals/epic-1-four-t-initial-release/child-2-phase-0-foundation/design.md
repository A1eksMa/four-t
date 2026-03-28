# Issue #2: Phase 0 — Foundation & Documentation

**Type:** Documentation
**Status:** Complete
**Epic:** #1
**Retrospective:** work completed before workflow was adopted

---

## Objective

Establish the complete documentation foundation for the four-t framework before
any implementation begins. All architectural decisions must be recorded, reviewed,
and stable enough to code against.

---

## Deliverables

### Core documentation (`docs/proposals/`)

| File | Purpose |
|------|---------|
| `functional-requirements.md` | FR-1–FR-5: widget, data model, i18n, wizard, deployment |
| `technical-requirements.md` | TR-1–TR-10: runtime, code style, modules, state, loading, i18n, time scale, effects, build, schema versioning |
| `architecture.md` | Module structure, internal types (LoadedData et al.), render loop, design decisions |
| `data-schema.md` | Complete schema for manifest.json and track files with field reference tables |
| `roadmap.md` | 6-phase plan with deliverables per phase |

### Example data (`4t-data/example/`)

| File | Status |
|------|--------|
| `manifest.json` | Complete — global config, 10-level scale, widget entry config |
| `languages.json` | Complete — 9 threads, full timelines, tool snapshots |
| `data.json` | Placeholder (`status: "placeholder"`) |
| `infra.json` | Placeholder |
| `systems.json` | Placeholder |
| `foundations.json` | Placeholder |

---

## Stage

### Stage 1: Documentation
One retrospective stage covering all documentation work.
See: `001-documentation.md`, `001-progress.md`
