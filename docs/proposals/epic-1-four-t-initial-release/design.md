# Epic #1: four-t v1.0 — Initial Release

**Type:** Epic
**Status:** In Progress
**Assignee:** A1eksMa

---

## Problem Statement

Professionals with broad, deep skill sets cannot adequately represent their growth story
in a resume paragraph or a simple skills table. Existing data storytelling tools
(Flourish, Datawrapper, Observable) are platform-locked and not embeddable.

The gap: a self-hosted, embeddable widget that renders an interactive narrative of
competency growth over time — usable on any static page with zero server requirements.

---

## Solution Overview

**four-t** — an embeddable visualization widget driven by plain JSON files.

```
Track → Thread → Timeline → Tool
```

Four entities, four drill-down levels, one widget. Data lives in files the user controls.
The widget is loaded from CDN or served locally.

---

## Technical Design

### Architecture

Three independent sub-packages sharing a data contract:

```
four-t/
├── 4t-widget/    Pure JS visualization (ECharts 5.x)
├── 4t-wizard/    Web constructor with live preview
└── 4t-data/      JSON schema + example data
```

### Key decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Visualization library | ECharts 5.6 | Rich chart types, CDN delivery, no framework deps |
| Code style | Functional, vanilla ES2020 | Testable, no `this`, no build step to use |
| Null safety | Option / Result monads | Explicit, composable, ~15 lines |
| Navigation | Stack-based | Supports variable depth, skip levels, any entry point |
| Data delivery | manifest.json + per-track files | Parallel loading, per-track editing |
| i18n | Inline `{ en, ru }` objects + locale files | Content and UI strings decoupled |

Full design decisions: [`docs/proposals/architecture.md`](../architecture.md)

---

## Implementation Phases

### Phase 0 — Foundation (Complete)
Establish architecture, data schema, and example data.
→ Child Issue #2

### Phase 1 — MVP Widget Extraction (Ready)
Extract the Hugo prototype into a standalone `widget.js`.
→ Child Issue #3

### Phase 2 — Example Data Completeness (Ready)
Fill remaining 4 track files with full data.
→ Child Issue #4

### Phase 3 — 4t-wizard (Planned, needs design session)
Web constructor with live preview and JSON export.
→ Child Issue #5

### Phase 4 — Polish & CDN Delivery (Planned)
Schema validation, build tooling, jsDelivr release.
→ Child Issue #6

### Phase 5 — Testing Infrastructure (Planned)
Unit tests for core modules using Node built-in test runner.
→ Child Issue #7

### Phase 6 — Self-hosted Demo (Planned)
nginx deployment on dedicated domain.
→ Child Issue #8

---

## Dependencies

- Apache ECharts 5.6.x (CDN or bundled)
- Node.js (optional, for bundling only)
- nginx (Phase 6 only)

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| ECharts API changes in 5.x | Medium | Pin to 5.6.0; upgrade explicitly |
| CDN unavailability (restricted networks) | Medium | Bundle ECharts option; local file fallback |
| Wizard complexity underestimated | High | Phase 3 requires dedicated design session before coding |
