# Stage 6: Public API

**Objective:** Wire all modules into `widget.js` — the single public entry point
**Duration:** ~1 session
**Dependencies:** Stages 1–5

---

## Step 6.1: `widget.js` — core wiring

**Action:** Implement `FourT.init` following the render loop in `architecture.md`

**Instance storage:**
```js
const instances = new Map()  // Map<symbol, Instance>
```

**`FourT.init` flow:**
1. `loadData(config.dataUrl)` → `Result<LoadedData>`
2. On `Err` → call `renderError(element, err)` and return `null`
3. On `Ok` →
   - `state = initState(config, data)`
   - `stateRef = { state }`
   - `chart = echarts.init(element, theme(state), { renderer: 'canvas' })`
   - `id = Symbol()`
   - `instances.set(id, { stateRef, chart, element, flipping: false })`
   - `attachHandlers(id)`
   - `render(id)`
   - return `id`

**`render(id)` flow** (see `architecture.md → render loop`):
- `buildOption(frame, state)` dispatches to L1–L4 builders
- `chart.setOption(option, true)`
- `updateBreadcrumb(state, element)` — show/hide crumb buttons, set labels
- `updateHint(state, element)` — update hint text from i18n

**`onChartClick(params, id)`** (see `architecture.md → onChartClick`):
- Guard: `if (inst.flipping) return`
- Resolve entity → nextType → nextFrame
- `applyEffect(exitEffect, element, callback, afterFlip)`

**`navigateBack(id, targetDepth)`** (see `architecture.md → navigateBack`):
- Guard: `if (inst.flipping) return`
- `applyEffect('flipX', element, () => { state = popTo(state, depth); render(id) }, ...)`

---

## Step 6.2: Remaining `FourT` methods

```js
FourT.update = (id, newData) => {
  // Replace data in stateRef.state, keep stack and lang
  // Re-render current level
}

FourT.destroy = (id) => {
  // chart.dispose()
  // Remove event listeners
  // instances.delete(id)
}

FourT.setLang = (id, lang) => {
  // stateRef.state = setLang(stateRef.state, lang)
  // render(id)
}

FourT.registerEffect = (name, fn) => registerEffect(name, fn)
```

---

## Step 6.3: Dark mode

**Action:** Add `MutationObserver` on `document.documentElement` watching `class` attribute

On dark/light toggle:
1. `chart.dispose()`
2. `chart = echarts.init(element, isDark ? 'dark' : null, { renderer: 'canvas' })`
3. `attachHandlers(id)` (re-attach click)
4. `render(id)` with `animation: false` to avoid re-entry flash

---

## Step 6.4: Resize handler

**Action:** `window.addEventListener('resize', () => chart.resize())`

Use `ResizeObserver` on the container element if available (more accurate than window resize).

---

## Step 6.5: `renderError(element, err)`

**Action:** Render a visible error state when data fails to load

```js
const renderError = (element, err) => {
  element.innerHTML = `<div style="...">Failed to load data: ${err}</div>`
}
```

---

## Definition of Done

- `widget.js` created in `4t-widget/`
- `FourT.init`, `update`, `destroy`, `setLang`, `registerEffect` all exported
- Dark mode toggle re-renders correctly
- Window resize re-renders correctly
- Load error shows visible message (not silent failure)
- Multiple `FourT.init` calls on different elements work independently
