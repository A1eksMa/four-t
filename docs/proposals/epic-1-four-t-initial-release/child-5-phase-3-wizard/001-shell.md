# Stage 1: Shell — layout, Vue scaffold, store, live preview, start dialog

**Issue:** #5
**Stage:** 001

---

## Goal

A working skeleton: `wizard.html` opens in browser, shows the widget preview (loaded
from `4t-data/example/`), and the reactive store is connected to `FourT.update()`.
The start dialog handles the localStorage restore flow. Undo/Redo buttons are wired.

At the end of this stage: changing data in the store re-renders the preview. The
editor panels are empty placeholders — that is expected.

---

## Checklist

### wizard.html
- [ ] Vertical layout: header / preview section / editor section
- [ ] Preview section: fixed height (`40vh`), contains widget container `div#preview`
- [ ] Editor section: scrollable, `div#editor` as Vue mount target
- [ ] Import Vue 3 from CDN (ESM)
- [ ] Import ECharts (same CDN tag as `index.html`)
- [ ] Import `4t-widget/widget.js` (FourT)
- [ ] Import `wizard.js` as ES module

### store.js
- [ ] `state` — reactive ref holding `LoadedData` (same shape as widget expects)
- [ ] `undoStack` — array of snapshots (max depth from settings)
- [ ] `redoStack` — array of snapshots
- [ ] `pushUndo(snapshot)` — push to undoStack, clear redoStack, trim to max depth
- [ ] `undo()` — pop undoStack → push current to redoStack → restore
- [ ] `redo()` — pop redoStack → push current to undoStack → restore
- [ ] `settings` — reactive ref: `{ undoDepth: 10 }`
- [ ] `saveSettings()` / `loadSettings()` — localStorage under `wizard_settings`
- [ ] `saveSession()` / `loadSession()` — localStorage under `wizard_session`
- [ ] `hasSession()` — boolean, checks localStorage

### wizard.js — start dialog
- [ ] On mount: check `hasSession()`
- [ ] If session exists: show dialog — "Resume / Open file / New"
  - Resume: `loadSession()` → hydrate store
  - Open file: trigger `<input type="file">` → parse JSON → hydrate store
  - New: empty state
- [ ] If no session: empty state (no dialog)
- [ ] "Open" button in header always available (same file input)
- [ ] "New" button in header: confirm → reset store to empty state

### wizard.js — preview integration
- [ ] `FourT.init(document.getElementById('preview'), { dataUrl: ... })` on mount
  with example data as initial render
- [ ] `watch(state, newData => FourT.update(instanceId, newData))` — live sync
- [ ] On widget click: intercept navigation frame → set `activePanel` in store

### wizard.js — header
- [ ] Title: "4t-wizard"
- [ ] [Undo] button — calls `store.undo()`, disabled when undoStack empty
- [ ] [Redo] button — calls `store.redo()`, disabled when redoStack empty
- [ ] [Settings] button — opens settings modal (empty placeholder this stage)
- [ ] [JSON] button — toggles JSON drawer (empty placeholder this stage)
- [ ] [Open] button — file input trigger
- [ ] [New] button — reset with confirm

### wizard.js — editor area
- [ ] `activePanel` computed from current navigation frame
  (`track` → tracks panel, `thread` → threads panel, etc.)
- [ ] Placeholder `<div>` for each panel showing panel name — real panels in stages 2–4

---

## Notes

- `FourT.update(id, data)` accepts a `LoadedData` object directly — no re-fetch needed.
  The wizard bypasses the loader entirely and manages data in-memory.
- Store state shape must exactly match `LoadedData` (see `architecture.md` → Internal types).
- Empty state: `{ meta: {}, scale: { divisions: [] }, tracks: [] }` — widget renders
  an empty chart without errors.
