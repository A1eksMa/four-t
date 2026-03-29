# Stage 1 Progress: Shell — layout, Vue scaffold, store, live preview, start dialog

**Issue:** #5
**Stage:** 001
**Status:** Complete
**Date:** 2026-03-29

---

## Result

`wizard.html` opens in browser. Widget preview is live (loads example data).
Store is connected to `FourT.update()` via a deep watcher — any change to `wizardData`
immediately re-renders the preview. Start dialog, Undo/Redo, Settings modal, JSON drawer,
and nav sync are implemented. Editor panels show a placeholder (Stage 2+).

## Checklist

### wizard.html
- [x] Vertical layout: header / preview (40vh) / editor (scrollable)
- [x] Import Vue 3 via importmap (`cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.prod.js`)
- [x] Import ECharts (same CDN as `index.html`)
- [x] Import `4t-widget/widget.js` (FourT)
- [x] Import `4t-wizard/wizard.js` as ES module

### store.js
- [x] `wizardData` — reactive ref holding `LoadedData`
- [x] `undoStack` / `redoStack` — refs of snapshot arrays
- [x] `pushUndo()` — snapshot before mutation, clears redo, trims to depth
- [x] `undo()` / `redo()` — swap stacks, restore state
- [x] `settings` — ref with `{ undoDepth: 10 }`
- [x] `saveSettings()` / `loadSettings()` (via `readSettings()` on init)
- [x] `saveSession()` / `loadSession()` / `hasSession()` / `clearSession()`
- [x] `loadFromData()` — loads data, resets stacks and nav
- [x] `resetToEmpty()` — empty canvas + clear session

### wizard.js — start dialog
- [x] On mount: `hasSession()` check
- [x] Dialog: Resume / Open file / New
- [x] Resume: `loadSession()` → hydrate store
- [x] Open file: `<input type="file">` → parse JSON → `loadFromData()`
- [x] New: `resetToEmpty()`

### wizard.js — preview integration
- [x] `FourT.init` on mount with example data
- [x] `watch(wizardData, newData => FourT.update(id, newData))` — live sync
- [x] `setupNavSync`: secondary ECharts click listener + breadcrumb delegation
  → updates `activeNav` to drive `panelLabel` and (Stage 2+) panel switching

### wizard.js — header
- [x] [Undo] / [Redo] — wired, disabled when stacks empty
- [x] [Settings] — opens modal with undoDepth parameter
- [x] [JSON] — toggles JSON drawer
- [x] [Open] — file input trigger
- [x] [New] — confirm + resetToEmpty
- [x] [EN/RU] — language toggle, calls `FourT.setLang`

### JSON drawer
- [x] Slides in from right (CSS transform)
- [x] Shows active track JSON (or manifest summary if no track selected)
- [x] Updates live via computed
- [x] "Copy to clipboard" with "Copied!" feedback

### Editor area
- [x] `panelLabel` computed from `activeNav` — shows context ("Threads — Python")
- [x] Placeholder div — real panels in Stage 2+

## Implementation notes

**`#app` flex container:** body is not the flex parent — `#app` itself is set to
`height: 100vh; display: flex; flex-direction: column` to correctly contain
the fixed-height preview and scrollable editor sections.

**Vue importmap:** Single importmap entry for `vue` ensures `store.js` and `wizard.js`
share the same Vue module instance (required for reactivity to work across modules).

**`watch` inside `onMounted`:** Called after widget init to avoid triggering
`FourT.update` before `previewId` is set. Vue 3 supports `watch` calls inside
lifecycle hooks.

**Nav sync approach:** A secondary ECharts click handler is attached after `FourT.init`
using `echarts.getInstanceByDom()`. This runs in parallel with the widget's own handler
without modifying `widget.js`. Breadcrumb back-navigation is handled via event
delegation on the preview container.
