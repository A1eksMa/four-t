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

`periodToMs` takes an explicit `scale` parameter rather than auto-detecting from the string
format, since the same year string `"2023"` would be ambiguous without context.

```js
// Parse a period string to milliseconds given a known scale type.
// Falls back to 'quarter' parsing for unknown scale values.
const periodToMs = (scale, period) => {
  const parsers = {
    quarter: p => new Date(+p.slice(0, 4), (parseInt(p.slice(5)) - 1) * 3, 1).getTime(),
    year:    p => new Date(+p, 0, 1).getTime(),
    month:   p => new Date(p + '-01').getTime(),
    week:    p => isoWeekToMs(p),
    day:     p => new Date(p).getTime(),
  }
  return getOrElse(Some(parsers[scale]), parsers['quarter'])(period)
}

// ISO 8601 week string "2023-W01" → timestamp of Monday of that week
const isoWeekToMs = p => {
  const [year, week] = p.split('-W').map(Number)
  const jan4      = new Date(year, 0, 4)        // Jan 4 is always in ISO week 1
  const dayOfWeek = jan4.getDay() || 7          // Sunday=0 → 7
  const monday    = new Date(jan4)
  monday.setDate(jan4.getDate() - (dayOfWeek - 1) + (week - 1) * 7)
  return monday.getTime()
}

// Returns the effective scale for a track.
// Uses the track's inline scale override when present; falls back to manifest scale.
const resolveScale = (manifestScale, track) =>
  track.scale ?? manifestScale

// Returns the tool snapshot most recently at or before periodMs.
// Uses the thread's timeline_config.scale for period parsing.
const getToolsAtPeriod = (thread, periodMs) => {
  const scale  = thread.timeline_config?.scale ?? 'quarter'
  const snaps  = thread.tools ?? []
  if (!snaps.length) return []
  const sorted = [...snaps].sort(
    (a, b) => periodToMs(scale, a.period) - periodToMs(scale, b.period)
  )
  const best = sorted.reduce(
    (acc, snap) => periodToMs(scale, snap.period) <= periodMs ? snap : acc,
    null
  )
  return best?.snapshot ?? []
}
```

**Phase 2 (deferred — not needed for MVP rendering):**

```js
// Normalize timeline points to a unified time axis
// (needed when mixing threads with different timeline_config.scale values)
const normalizeTimeline = (config, points) => { /* Phase 2 */ }

// Aggregate points from different scales to a target scale
const aggregateTimeline = (config, points, targetScale) => { /* Phase 2 */ }

// Apply edge handling before first and after last point on a rendered axis
const applyEdges = (config, points, axisMin, axisMax) => { /* Phase 2 */ }
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

## Internal types

These are the in-memory shapes used across all modules. They are not stored anywhere — they
are the output of `loader.js` and the input to everything else.

### `LoadedData`

The single merged object produced by `loader.js` after fetching manifest + all track files.
All file references are resolved; all optional fields have defaults filled in.

```js
// LoadedData — passed into initState() and held in State.data
{
  meta:   { title: LocaleString, author: string },
  scale:  Scale,                  // manifest-level default scale
  style:  { theme: 'light' | 'dark' | 'auto' },
  widget: { entry: EntityType, entry_track: string | null, entry_thread: string | null },
  tracks: TrackData[]
}

// TrackData — one per track file, merged into LoadedData.tracks
{
  id:       string,
  name:     LocaleString,
  color:    string,               // hex
  level:    number,
  status:   'active' | 'placeholder',
  on_click: EntityType | null,    // null = terminal (non-clickable)
  scale:    Scale | null,         // inline override; null = use LoadedData.scale
  chart:    ChartMeta | null,
  threads:  ThreadData[]
}

// ThreadData
{
  id:              string,
  name:            LocaleString,
  level:           number,
  status:          'active' | 'archive',
  on_click:        EntityType | null,
  chart:           ChartMeta | null,
  timeline_config: TimelineConfig,  // always present after loader fills defaults
  timeline:        TimelinePoint[],
  tools:           ToolSnapshot[]
}

// TimelinePoint
{ period: string, level: number, annotation: LocaleString | null }

// ToolSnapshot
{ period: string, snapshot: ToolEntry[] }

// ToolEntry
{ name: string, level: number }

// Scale
{ id: string, min: number, max: number, divisions: ScaleDivision[] }

// ScaleDivision
{ value: number, label: LocaleString, desc: LocaleString }

// ChartMeta
{
  title:    LocaleString | null,
  pre_text: LocaleString | null,
  post_text: LocaleString | null,
  effects:  { enter: string, exit: string }
}

// TimelineConfig (defaults filled by loader)
{
  scale:         'day' | 'week' | 'month' | 'quarter' | 'year',  // default: 'quarter'
  interpolation: 'step' | 'linear' | 'smooth',                   // default: 'smooth'
  edge_before:   'zero' | 'extend' | 'null',                     // default: 'zero'
  edge_after:    'zero' | 'extend' | 'null',                     // default: 'extend'
  aggregation:   'last' | 'max' | 'avg',                         // default: 'last'
  bar_click:     'tools' | null                                   // default: 'tools'
}
```

### Navigation frame

The atomic element of the navigation stack. Each frame carries exactly the context needed
to render its level.

```js
{ type: 'track' }
{ type: 'thread',   trackId: string }
{ type: 'timeline', trackId: string, threadId: string }
{ type: 'tools',    trackId: string, threadId: string, periodMs: number }
```

### Instance

Per-widget runtime state, stored in the module-level `instances` Map.

```js
// instances: Map<symbol, Instance>
{
  stateRef: { state: State },   // mutable wrapper around the current immutable State
  chart:    EChartsInstance,
  element:  HTMLElement,
  flipping: boolean             // guard: prevents overlapping transition effects
}
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

## Widget public API and render loop (`widget.js`)

### Public API

```js
export const FourT = {
  // Initialize widget in a container element.
  // Returns a symbol instanceId used by all other methods.
  init: (element, config) => { ... },

  // Re-render current level with new data (used by wizard for live preview).
  update: (instanceId, data) => { ... },

  // Tear down ECharts instance and remove all event listeners.
  destroy: (instanceId) => { ... },

  // Switch language without re-fetching data; re-renders current level.
  setLang: (instanceId, lang) => { ... },

  // Register a custom transition effect by name.
  registerEffect: (name, fn) => { ... }
}
```

Multiple instances per page are supported via `instanceId` (a `Symbol` returned by `init`).
Instances are stored in a module-level `Map<symbol, Instance>`.

---

### Internal render loop

The widget is driven by a single `render` function called on every state change.
`stateRef` is a mutable object `{ state }` wrapping the current immutable `State`.
This avoids closures capturing stale state while keeping state transitions pure.

```
init(element, config)
 │
 ├─ loadData(config.dataUrl)        → Result<LoadedData>
 │   ├─ on Err  → renderError(element, err)  [stop]
 │   └─ on Ok   →
 │       state    = initState(config, loadedData)
 │       stateRef = { state }
 │       chart    = echarts.init(element, theme(state))
 │       id       = Symbol()
 │       instances.set(id, { stateRef, chart, element, flipping: false })
 │       attachHandlers(id)
 │       render(id)
 │       return id
 │
render(id)
 │   inst   = instances.get(id)
 │   frame  = currentFrame(inst.stateRef.state)
 │   option = buildOption(frame, inst.stateRef.state)
 │   inst.chart.setOption(option, true)
 │   updateBreadcrumb(inst.stateRef.state, inst.element)
 │   updateHint(inst.stateRef.state, inst.element)
 │
buildOption(frame, state)
 │   match frame.type:
 │     'track'    → buildL1Option(state.data.tracks, state.lang)
 │     'thread'   → buildL2Option(getTrack(state.data, frame.trackId), state.lang)
 │     'timeline' → buildL3Option(getThread(state.data, frame.trackId, frame.threadId),
 │                                zeroed: false, state.lang)
 │     'tools'    → buildL4Option(getThread(state.data, frame.trackId, frame.threadId),
 │                                frame.periodMs, state.lang)
 │
onChartClick(params, id)
 │   inst = instances.get(id)
 │   if inst.flipping: return            ← guard against overlapping effects
 │
 │   frame  = currentFrame(inst.stateRef.state)
 │   entity = resolveEntity(frame, params, inst.stateRef.state.data)
 │   if !entity: return
 │
 │   nextType = resolveNext(entity, frame.type)   ← nav.js
 │   if !nextType: return                         ← terminal node
 │
 │   nextFrame = buildNextFrame(nextType, entity, params, inst.stateRef.state)
 │   exitEffect = entity.chart?.effects?.exit ?? 'none'
 │
 │   inst.flipping = true
 │   applyEffect(exitEffect, inst.element,
 │     callback: () => {
 │       inst.stateRef.state = pushLevel(inst.stateRef.state, nextFrame)
 │       render(id)
 │     },
 │     afterFlip: () => {
 │       inst.flipping = false
 │       if nextFrame.type === 'timeline': growL3(id)
 │     }
 │   )
```

### `buildNextFrame` — frame construction per transition

```js
// Builds the navigation stack frame for the next level.
const buildNextFrame = (nextType, entity, params, state) => {
  const frame = currentFrame(state)
  switch (nextType) {
    case 'thread':
      // Clicking a Track bar → enter Thread level for that track
      return { type: 'thread', trackId: entity.id }

    case 'timeline':
      // Clicking a Thread bar → enter Timeline level for that thread
      return { type: 'timeline', trackId: frame.trackId, threadId: entity.id }

    case 'tools': {
      // Clicking a Timeline bar → enter Tools level for that period
      const thread   = getThread(state.data, frame.trackId, frame.threadId)
      const scale    = thread.timeline_config.scale
      const period   = thread.timeline[params.dataIndex].period
      return { type: 'tools', trackId: frame.trackId, threadId: frame.threadId,
               periodMs: periodToMs(scale, period) }
    }
  }
}
```

### Back navigation (breadcrumb clicks)

Breadcrumb items call `navigateBack(id, targetDepth)`:

```js
const navigateBack = (id, targetDepth) => {
  const inst = instances.get(id)
  if (inst.flipping) return
  const backEffect = 'flipX'       // fixed effect for back navigation
  inst.flipping = true
  applyEffect(backEffect, inst.element, () => {
    inst.stateRef.state = popTo(inst.stateRef.state, targetDepth)
    render(id)
  }, () => { inst.flipping = false })
}
```

`targetDepth` is the index in the stack (0 = L1 / track overview).

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
