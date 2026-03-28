# Issue #3: Phase 1 — MVP Widget Extraction

**Type:** Feature
**Status:** Ready to start
**Epic:** #1
**Depends on:** #2 (complete)

---

## Objective

Extract the working Hugo prototype (`layouts/skills/list.html`, ~450 lines) into a
standalone, Hugo-independent `widget.js` driven by `manifest.json` + track files.

**Deliverable:** `four-t/index.html` renders the full languages track visualization
using `4t-data/example/` data with no Hugo required.

---

## Technical Approach

The prototype is a monolithic IIFE. The extraction strategy is:
1. Build core infrastructure from scratch (small, well-typed modules)
2. Extract chart builders and effects directly from the prototype
3. Wire everything together in `widget.js` using the documented render loop
4. Validate with `index.html` demo

Source of truth for implementation:
- Internal types: `docs/proposals/architecture.md` → Internal types
- Render loop: `docs/proposals/architecture.md` → Widget render loop
- Each module's implementation: `docs/proposals/architecture.md` → Core modules

---

## Module Delivery Plan

```
4t-widget/
├── core/
│   ├── option.js       Stage 1
│   ├── result.js       Stage 1
│   ├── i18n.js         Stage 1
│   ├── scale.js        Stage 1
│   ├── loader.js       Stage 2
│   ├── state.js        Stage 3
│   └── nav.js          Stage 3
├── i18n/
│   ├── en.json         Stage 1
│   └── ru.json         Stage 1
├── effects/
│   ├── none.js         Stage 4
│   ├── flipX.js        Stage 4
│   ├── flipY.js        Stage 4
│   ├── grow.js         Stage 4
│   └── registry.js     Stage 4
├── charts/
│   ├── L1_tracks.js    Stage 5
│   ├── L2_threads.js   Stage 5
│   ├── L3_timeline.js  Stage 5
│   └── L4_tools.js     Stage 5
└── widget.js           Stage 6
index.html              Stage 7
```

---

## Stages

| # | Stage | Key deliverable |
|---|-------|-----------------|
| 1 | Core Infrastructure | option, result, i18n, scale + locale files |
| 2 | Data Layer | loader.js — fetch manifest → LoadedData |
| 3 | State & Navigation | state.js, nav.js |
| 4 | Effects | 4 effects + registry |
| 5 | Chart Builders | L1–L4 pure functions |
| 6 | Public API | widget.js — FourT.init/update/destroy/setLang |
| 7 | Demo Page | index.html works offline and via CDN |

---

## Testing Strategy

Each stage is verified by running `index.html` in a browser after the stage completes.
No automated tests in Phase 1 (testing infrastructure is Phase 5).

Manual verification checklist per stage is in each `00X-stage.md` file.
