# Stage 3: State & Navigation

**Objective:** Implement immutable state management and navigation graph
**Duration:** ~0.5 session
**Dependencies:** Stage 1 (option.js)

---

## Step 3.1: `core/state.js`

**Action:** Implement immutable state container with pure transition functions

**State shape** (`architecture.md → Internal types → Instance`):
```js
{
  stack:  [{ type, trackId?, threadId?, periodMs? }],
  lang:   string,
  data:   LoadedData,
  config: WidgetConfig
}
```

**Functions to implement:**
```js
export const initState = (config, data) => ({
  stack:  [buildEntryFrame(config.widget, data)],
  lang:   config.lang ?? 'en',
  data,
  config
})

export const pushLevel     = (state, frame) =>
  ({ ...state, stack: [...state.stack, frame] })

export const popTo         = (state, depth) =>
  ({ ...state, stack: state.stack.slice(0, depth + 1) })

export const setLang       = (state, lang) => ({ ...state, lang })

export const currentFrame  = state => state.stack.at(-1)
export const stackDepth    = state => state.stack.length - 1
```

**`buildEntryFrame`** — constructs the initial frame from `widget.entry` config:
```js
const buildEntryFrame = (widgetConfig, data) => {
  const { entry, entry_track, entry_thread } = widgetConfig
  switch (entry) {
    case 'thread':   return { type: 'thread',   trackId: entry_track }
    case 'timeline': return { type: 'timeline', trackId: entry_track, threadId: entry_thread }
    case 'tools':    return { type: 'tools',    trackId: entry_track, threadId: entry_thread, periodMs: null }
    default:         return { type: 'track' }
  }
}
```

**Verification:**
- `initState(config, data).stack.length === 1`
- `pushLevel(state, frame).stack.length === state.stack.length + 1`
- Original state not mutated after `pushLevel`
- `popTo(state, 0).stack.length === 1`

---

## Step 3.2: `core/nav.js`

**Action:** Implement navigation graph — resolves where a click leads

**Functions to implement:**
```js
const DEFAULT_CHAIN = {
  track: 'thread', thread: 'timeline', timeline: 'tools', tools: null
}

// Returns next entity type for a click on entity at entityType level
export const resolveNext = (entity, entityType) =>
  entity.on_click !== undefined ? entity.on_click : DEFAULT_CHAIN[entityType]

// True if clicking this entity navigates somewhere
export const canDrillDown = (entity, entityType) =>
  resolveNext(entity, entityType) !== null

// Helpers to look up entities by id from LoadedData
export const getTrack  = (data, trackId)           => data.tracks.find(t => t.id === trackId)
export const getThread = (data, trackId, threadId) =>
  getTrack(data, trackId)?.threads.find(t => t.id === threadId)
```

**`buildNextFrame`** — see `architecture.md → Widget render loop → buildNextFrame`:
```js
export const buildNextFrame = (nextType, entity, params, state) => { ... }
```

**Verification:**
- `resolveNext({ on_click: null }, 'track') === null` (terminal)
- `resolveNext({}, 'track') === 'thread'` (default chain)
- `resolveNext({ on_click: 'tools' }, 'thread') === 'tools'` (skip timeline)
- `getTrack(data, 'languages').id === 'languages'`

---

## Definition of Done

- `state.js` and `nav.js` created in `4t-widget/core/`
- All transition functions return new objects (no mutation)
- `buildNextFrame` handles all four transition types
- Navigation respects `on_click` overrides and `DEFAULT_CHAIN`
