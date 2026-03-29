# Issue #5: Phase 3 — 4t-wizard

**Type:** Feature
**Status:** Ready to implement
**Epic:** #1
**Depends on:** #3 (complete), #4 (complete)

---

## Objective

Build a web-based constructor for authoring four-t data files, with a live widget
preview. The wizard produces `manifest.json` + track files that can be dropped next
to `index.html` and rendered by the widget immediately.

**Deliverable:** `four-t/wizard.html` — open in browser, build a dataset, export files.
Hosted at `https://a1exma.online/wizard` (Issue #8 Stage 2).

---

## Design Decisions

### D1: Vue 3 via ESM CDN — no build step

**Decision:** Use Vue 3 imported from CDN (`esm.run` or `jsdelivr`), same as ECharts
in the widget. No bundler, no npm, no build step.

**Rationale:** The project has no build tooling by design. The wizard is a single-page
web application with reactive state — Vue 3's reactivity system (`ref`, `computed`,
`watch`) maps cleanly onto the required patterns (undo stack, live preview sync,
accordion panels). Alpine.js was considered but rejected: complex shared state
(undo/redo, preview sync) becomes unwieldy without a proper reactivity model.
Preact+htm was considered but rejected: immutable state boilerplate adds friction
for a single-developer utility tool.

**Trade-off:** Vue 3 CDN adds ~34KB (min+gzip). Acceptable for a developer tool
not subject to page load performance requirements.

### D2: Editor follows widget navigation (synchronized state)

**Decision:** Clicking a chart element in the preview panel switches the editor
panel to the corresponding entity. The same shared reactive store drives both.

**Rationale:** The widget already has a navigation model (track → thread → timeline →
tools). Reusing it for editor navigation eliminates a separate navigation layer and
makes the wizard feel like a natural extension of the widget.

**Implementation:** The wizard intercepts `FourT`'s click events (or wraps `onChartClick`)
and maps the resulting navigation frame to the active editor panel.

### D3: Accordion pattern for all entity panels

**Decision:** All four panels (tracks, threads, timeline, tools) use the same
accordion component: a list of entity rows, each expandable to show its edit form.
Toolbar at top: Add / Delete selected.

**Rationale:** Uniform interaction pattern reduces cognitive load. The component is
written once and parameterised by entity type and field schema.

### D4: Start dialog with localStorage restore

**Decision:**
- If localStorage is empty → show empty canvas
- If localStorage has a saved session → show dialog: "Resume last session? / Open file / New"
- "Open" button always visible in header; file dialog defaults to `4t-data/example/`
- "New" clears the canvas after confirmation

**Rationale:** Prevents accidental loss of work-in-progress. The file dialog browser
memory means `4t-data/example/` is effectively the default on first use.

### D5: Undo/Redo with configurable depth

**Decision:** Full undo/redo stack. Default depth: 10. Depth is a user setting,
stored in localStorage under a separate `wizard_settings` key.

**Rationale:** Undo-only was considered but rejected — redo is essential when
evaluating alternatives. Configurable depth because power users working on large
datasets may want deeper history.

### D6: Settings panel

**Decision:** A modal settings panel accessible from the header. Initial parameters:
- Undo stack depth (number input, default 10)

**Rationale:** Global wizard parameters should not live in the main editor chrome.
The settings panel is designed as an extensible registry — more parameters will be
added in future phases without restructuring the UI.

### D7: JSON drawer panel

**Decision:** A drawer that slides in from the right, hidden by default, toggled
by a button in the header. Shows the serialized JSON of the currently active track.
Updates live on every edit. "Copy to clipboard" button at the bottom.

**Rationale:** Useful during authoring to inspect the exact output without running
export. Requested as a core feature during design session.

### D8: Utilitarian design

**Decision:** Minimal styling — system fonts, no design system, no animations beyond
functional ones (accordion expand, drawer slide). Functionality over UX polish.

**Rationale:** This is a developer/author tool. The target user is the data author,
not an end user. Time is better spent on correctness and completeness of editing
capabilities.

---

## Layout

```
┌─────────────────────────────────────────────────────┐
│ HEADER: [4t-wizard] [Undo] [Redo] [Settings] [JSON] │
├─────────────────────────────────────────────────────┤
│                                                     │
│   PREVIEW (widget iframe / FourT instance)          │
│   — fixed height, shows chart + titles/annotations  │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│   EDITOR PANEL (scrollable, unlimited height)       │
│   — switches panel based on active navigation frame │
│   — accordion: list of entities + expand → form     │
│   — toolbar: [+ Add] [🗑 Delete]                    │
│                                                     │
│   ...                                               │
│                                                     │
└─────────────────────────────────────────────────────┘

                              ┌──────────────────────┐
                              │ JSON DRAWER (overlay) │
                              │                      │
                              │  { "id": "...",      │
                              │    "threads": [...] } │
                              │                      │
                              │  [Copy to clipboard] │
                              └──────────────────────┘
```

---

## File structure

```
4t-wizard/
├── wizard.html         Entry point, Vue app mount, layout
├── wizard.js           App bootstrap, panel router, FourT integration
├── store.js            Reactive state: data + undo/redo stack + settings
├── exporter.js         Serialize state → manifest.json + track files
│
├── panels/
│   ├── tracks.js       Tracks accordion panel
│   ├── threads.js      Threads accordion panel
│   ├── timeline.js     Timeline rows panel
│   └── tools.js        Tool snapshots panel
│
└── controls/
    ├── slider.js       Level slider bound to scale divisions
    ├── toggle.js       On/off toggle for optional properties
    ├── color-picker.js Native <input type="color"> wrapper
    └── effects-picker.js  Dropdown from effects registry keys
```

---

## Stages

| # | File | Title |
|---|------|-------|
| 1 | `001-shell.md` | Shell: layout, Vue scaffold, store, live preview, start dialog |
| 2 | `002-tracks-panel.md` | Tracks panel: accordion CRUD, all track fields |
| 3 | `003-threads-panel.md` | Threads panel + preview navigation sync |
| 4 | `004-timeline-tools.md` | Timeline and Tools panels |
| 5 | `005-scale-controls.md` | Scale editor + all reusable controls |
| 6 | `006-export-settings.md` | Export, JSON drawer, settings panel, localStorage |
