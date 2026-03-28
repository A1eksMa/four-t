# Architecture

## Overview

four-t is structured as three independent sub-packages sharing a data contract:

```
four-t/
├── 4t-widget/    Visualization widget (public-facing)
├── 4t-wizard/    Data constructor (tool for data authors)
└── 4t-data/      Shared data schema and example data
```

The wizard uses the widget as a dependency (imports `widget.js`). Neither the widget nor the wizard depends on the wizard or the widget respectively.

---

## 4t-widget — internal structure

```
4t-widget/
├── core/
│   ├── option.js       Option monad (Some / None) + match helper
│   ├── result.js       Result monad (Ok / Err) for fetch/parse errors
│   ├── loader.js       Data loading: manifest → track files (Promise.all)
│   ├── scale.js        Period parsing, normalization, aggregation
│   ├── state.js        Immutable state + pure transition functions
│   ├── nav.js          Navigation graph: on_click resolution, stack ops
│   └── i18n.js         resolveField(), getString(), locale loading
│
├── charts/
│   ├── L1_tracks.js    (data, config) => EChartsOption
│   ├── L2_threads.js   (data, config) => EChartsOption
│   ├── L3_timeline.js  (data, config) => EChartsOption
│   └── L4_tools.js     (data, config) => EChartsOption
│
├── effects/
│   ├── registry.js     Map<name, EffectFn> + registerEffect()
│   ├── flipX.js        rotateY flip (L1↔L2 transition)
│   ├── flipY.js        rotateX flip (L2↔L3 transition)
│   ├── grow.js         grow-from-bottom animation (L3 data appear)
│   └── none.js         no-op (dom, cb) => cb()
│
├── i18n/
│   ├── en.json
│   └── ru.json
│
└── widget.js           Public API: FourT.init / update / destroy / setLang
```

---

## Core modules

### `core/option.js`

```js
export const Some  = value => ({ tag: 'Some', value })
export const None  = ()    => ({ tag: 'None' })
export const map      = (opt, f) => opt.tag === 'Some' ? Some(f(opt.value)) : opt
export const flatMap  = (opt, f) => opt.tag === 'Some' ? f(opt.value)       : opt
export const getOrElse = (opt, def) => opt.tag === 'Some' ? opt.value : def
export const match = patterns => opt => (patterns[opt.tag] ?? patterns['_'])(opt.value)
```

### `core/result.js`

```js
export const Ok  = value => ({ tag: 'Ok',  value })
export const Err = error => ({ tag: 'Err', error })
export const mapResult  = (r, f) => r.tag === 'Ok' ? Ok(f(r.value)) : r
export const flatMapResult = (r, f) => r.tag === 'Ok' ? f(r.value) : r
```

### `core/state.js`

State is a plain object. Transitions are pure functions returning a new state.

```js
// Initial state
const initState = (config, data) => ({
  stack:  [{ type: 'track', id: null, meta: {} }],
  lang:   config.lang ?? 'en',
  data,
  config
})

// Transitions — pure functions
const pushLevel  = (state, frame) => ({ ...state, stack: [...state.stack, frame] })
const popTo      = (state, depth) => ({ ...state, stack: state.stack.slice(0, depth + 1) })
const setLang    = (state, lang)  => ({ ...state, lang })
const currentFrame = state => state.stack.at(-1)
```

### `core/nav.js`

Navigation is a graph, not a fixed 4-step sequence. Each entity declares `on_click` which resolves to the next frame type.

```js
// Default navigation chain (overridden by on_click per entity)
const DEFAULT_CHAIN = { track: 'thread', thread: 'timeline', timeline: 'tools', tools: null }

const resolveNext = (entity, entityType) =>
  entity.on_click !== undefined
    ? entity.on_click          // explicit override
    : DEFAULT_CHAIN[entityType]  // default chain

const canDrillDown = (entity, entityType) =>
  resolveNext(entity, entityType) !== null
```

### `core/scale.js`

Pure functions for period manipulation.

```js
// Parse any period string to milliseconds
const periodToMs = match({
  quarter: p => new Date(+p.slice(0,4), (parseInt(p.slice(5))-1)*3, 1).getTime(),
  year:    p => new Date(+p, 0, 1).getTime(),
  month:   p => new Date(p + '-01').getTime(),
  week:    p => isoWeekToMs(p),
  day:     p => new Date(p).getTime()
})

// Normalize timeline points to a unified time axis
const normalizeTimeline = (config, points) => { ... }

// Aggregate points from different scales to a target scale
const aggregateTimeline = (config, points, targetScale) => { ... }

// Apply edge handling before first and after last point
const applyEdges = (config, points, axisMin, axisMax) => { ... }
```

### `core/i18n.js`

```js
// Resolves { en: '...', ru: '...' } or plain string, with fallback
const resolveField = (field, lang) =>
  typeof field === 'string' ? field
  : field?.[lang] ?? field?.['en'] ?? ''

// Resolves a UI key from loaded locale file, with fallback
const getString = (locale, key) => locale?.[key] ?? key
```

---

## Chart builders (`charts/L*.js`)

Each chart builder is a **pure function**. It takes data and config, returns an ECharts option object. It does not touch the DOM.

```js
// charts/L1_tracks.js
export const buildL1Option = (tracks, config) => ({
  tooltip: { ... },
  xAxis:   { ... },
  yAxis:   { ... },
  series:  [ ... ]
})

// charts/L3_timeline.js
export const buildL3Option = (thread, tlConfig, config) => ({
  // bar series (zeroed flag for initial animation state)
  // line series with inline annotation labels
  // dataZoom
})
```

The widget controller calls the builder, then hands the result to `chart.setOption(option, true)`.

---

## Effects (`effects/`)

Each effect module exports a single function:

```js
// effects/flipX.js
// Rotates the chart DOM around the Y axis (horizontal flip)
export const flipX = (dom, callback, afterFlip) => {
  // CSS transform sequence: rotate out → swap content → rotate in
}
```

The registry maps names to functions and supports runtime extension:

```js
// effects/registry.js
const registry = new Map([
  ['flipX', flipX],
  ['flipY', flipY],
  ['grow',  grow],
  ['none',  none],
])

export const applyEffect = (name, dom, cb, after) =>
  getOrElse(Some(registry.get(name)), none)(dom, cb, after)

export const registerEffect = (name, fn) => registry.set(name, fn)
```

---

## Widget public API (`widget.js`)

```js
export const FourT = {
  // Initialize widget in a container element
  init: (element, config) => { ... },

  // Re-render current level with new data (used by wizard)
  update: (instanceId, data) => { ... },

  // Tear down and remove event listeners
  destroy: (instanceId) => { ... },

  // Switch language without re-fetching data
  setLang: (instanceId, lang) => { ... },

  // Add a custom transition effect
  registerEffect: (name, fn) => { ... }
}
```

Multiple instances per page are supported via `instanceId` (returned by `init`).

---

## 4t-wizard — internal structure

```
4t-wizard/
├── panels/
│   ├── tracks.js       Track CRUD panel
│   ├── threads.js      Thread CRUD panel
│   ├── timeline.js     Timeline node editor
│   └── tools.js        Tool snapshot editor
│
├── controls/
│   ├── slider.js       Level slider bound to scale divisions
│   ├── toggle.js       On/off toggle for optional properties
│   ├── color-picker.js Inline color input for track color
│   └── effects-picker.js  Dropdown from effects registry keys
│
├── store.js            Wizard state: current data + undo stack
├── exporter.js         Serialize state to manifest.json + track files
└── wizard.js           Entry point: mounts panels, connects to widget
```

The wizard maintains its own state store with an **undo stack** (array of previous data snapshots). On each edit, a snapshot is pushed before the mutation. Undo reverts to the previous snapshot and re-renders the preview.

The wizard calls `FourT.update(id, newData)` on every state change, which triggers a live re-render of the preview widget.

---

## Data flow

```
manifest.json
     │ fetch
     ▼
 loader.js ──► Promise.all(track files) ──► merge into LoadedData
                                                    │
                                               state.js (init)
                                                    │
                                             ┌──────▼──────┐
                                             │  widget.js  │
                                             │  (render)   │
                                             └──────┬──────┘
                                                    │ currentFrame
                                                    ▼
                                           charts/L{n}.js (pure)
                                                    │ EChartsOption
                                                    ▼
                                             chart.setOption()
                                                    │
                                          user click event
                                                    │
                                              nav.js resolveNext
                                                    │
                                        effects/registry applyEffect
                                                    │ callback
                                                    ▼
                                             state.js pushLevel
                                                    │
                                             (render loop)
```

---

## Design decisions

### Why not a class-based widget?
Classes with `this` scatter state across methods and make testing harder. A module-level pure function approach makes every transformation independently testable and avoids `this`-binding bugs in event handlers.

### Why a manifest + per-track files (not one big file)?
- Each track file can be edited independently without touching others
- The wizard writes one file at a time on save
- Partial loading: large datasets load in parallel and can be lazy-loaded by track

### Why Option/Result monads in vanilla JS?
Null checks scattered across code cause subtle bugs. Centralizing null-safety in `Option` makes missing data explicit and composable. Implementation is ~15 lines — no library needed.

### Why a navigation stack instead of level numbers?
`level: 1|2|3|4` assumes a fixed depth and fixed sequence. A stack supports:
- Skipping levels (thread → tools)
- Starting at any level
- Future extension to non-linear navigation

### Why effects as a registry?
Hardcoding animation logic inside the navigation handler couples unrelated concerns. A registry lets effects be added, replaced, or disabled without touching navigation logic. The wizard can enumerate `registry.keys()` to build its picker dropdown.
