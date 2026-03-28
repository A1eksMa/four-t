# four-t

**four-t** is an embeddable, zero-dependency widget for telling a story with competency data.

It renders an interactive multi-level visualization — drill-down from broad skill areas down to individual tools — using [Apache ECharts](https://echarts.apache.org/). Designed for anyone whose skill set is too wide and deep to fit in one paragraph of a resume.

```
Track → Thread → Timeline → Tool
```

These four entities give the framework its name.

---

## What it does

- Renders a **4-level interactive chart** from a simple JSON data file
- Each level is a different chart type with animated transitions (flip effects)
- Supports **partial depth** — use 1, 2, 3, or all 4 levels per entity
- **Multilingual** — content and UI strings in any number of languages
- **Themeable** — light, dark, or auto (follows system preference)
- Works on any static page: no server, no build step required

## Levels

| Level | Entity | Default chart | Drill-down from |
|-------|--------|---------------|-----------------|
| L1 | **Track** | Vertical bar — all tracks | Entry point |
| L2 | **Thread** | Horizontal bar — threads in a track | Click on Track |
| L3 | **Timeline** | Bar + Line + annotations | Click on Thread |
| L4 | **Tool** | Bubble chart — tools for a period | Click on Timeline bar |

Navigation depth is configurable per entity — skip levels, reorder, or start from any level.

---

## Quick start

```html
<!-- 1. Load ECharts (or bundle it in) -->
<script src="https://cdn.jsdelivr.net/npm/echarts@5.6.0/dist/echarts.min.js"></script>

<!-- 2. Load the widget -->
<script src="https://cdn.jsdelivr.net/gh/your-org/four-t@1.0.0/4t-widget/widget.js"></script>

<!-- 3. Place the container -->
<div id="my-widget"></div>

<!-- 4. Initialize -->
<script>
  FourT.init(document.getElementById('my-widget'), {
    dataUrl: './data/manifest.json',
    lang: 'en'
  })
</script>
```

Data lives in two files:

```
data/
  manifest.json       ← global config, scale, list of tracks
  languages.json      ← one file per track
```

See [`4t-data/example/`](./4t-data/example/) for a working example.

---

## Repository structure

```
four-t/
├── 4t-widget/          Embeddable visualization widget
│   ├── core/           Data loading, state, navigation, i18n, scale
│   ├── charts/         Pure chart-option builders (one per level)
│   ├── effects/        Transition effect registry + individual effects
│   └── widget.js       Public API entry point
│
├── 4t-wizard/          Web-based data constructor with live preview
│   ├── panels/         CRUD panels for each entity type
│   ├── controls/       Slider, toggle, effects-picker
│   └── wizard.js       Entry point
│
├── 4t-data/            JSON schema + example data
│   ├── schema.json     JSON Schema for validation
│   └── example/        Ready-to-use example (competency map)
│
└── docs/
    └── proposals/      Architecture decisions and specifications
```

---

## 4t-wizard

The wizard is a standalone static page that embeds the widget as a live preview. Edit any entity property and the chart updates instantly. When done, export `manifest.json` and track files.

```
┌──────────────────────────────────────────┐
│                                          │
│        4t-widget  (live preview)         │
│                                          │
├──────────────────────────────────────────┤
│  [ Tracks ] [ Threads ] [ Tools ]   [EN/RU]
│  ┌────────────────────────────────────┐  │
│  │  CRUD for selected entity          │  │
│  │  Timeline nodes, scale slider      │  │
│  └────────────────────────────────────┘  │
│  [ Export ZIP ]  [ Copy JSON ]           │
└──────────────────────────────────────────┘
```

---

## Delivery options

| Option | How |
|--------|-----|
| CDN | `jsdelivr.net/gh/your-org/four-t@version/4t-widget/widget.js` |
| Local file | Download and serve alongside your page |
| Git submodule | `git submodule add https://github.com/your-org/four-t` |

ECharts can be bundled inside the widget or loaded separately — configurable at build time.

---

## Design principles

- **Functional style** — pure functions, immutable state, Option monad for null-safety
- **Flat data structures** — no deeply nested objects
- **Modular** — each concern in its own file; effects, charts, i18n are independent modules
- **Schema-versioned** — every data file carries `"4t": "1.0"` for forward compatibility
- **No framework dependencies** — vanilla JS + ECharts only

---

## License

MIT
