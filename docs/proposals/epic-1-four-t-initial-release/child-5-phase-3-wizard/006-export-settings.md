# Stage 6: Export, JSON drawer, settings panel, localStorage

**Issue:** #5
**Stage:** 006

---

## Goal

The wizard is complete: data can be exported as files, the JSON drawer shows live
output, settings panel is functional, and localStorage autosave works reliably.
After this stage, Issue #5 is closed.

---

## Checklist

### `exporter.js`
- [ ] `serializeManifest(state)` → `manifest.json` content (JSON string)
  - Includes: `4t` version, `meta`, `scale`, `style`, `widget`, track references
  - Track references: `{ id, file: "{id}.json" }` — file per track
- [ ] `serializeTrack(track)` → `{track.id}.json` content (JSON string)
  - Full track data including all threads, timeline, tools
- [ ] `downloadZip(state)` — generates ZIP in-browser using `JSZip` (CDN), triggers download
  - ZIP contains: `manifest.json` + one file per track
- [ ] `copyTrackJson(track)` — copies `serializeTrack(track)` to clipboard
  (`navigator.clipboard.writeText`)

### JSON drawer (`wizard.js`)
- [ ] Drawer element: fixed right side, full height, ~400px wide, `z-index` overlay
- [ ] Toggle button in header: [JSON] — shows/hides drawer
- [ ] Slide animation: CSS `transform: translateX` transition
- [ ] Content: `<pre>` with syntax-highlighted JSON of active track
  (active = currently selected in editor, or first track if none selected)
- [ ] Updates live: `computed(() => serializeTrack(activeTrack.value))`
- [ ] "Copy to clipboard" button at bottom of drawer
  - On click: `copyTrackJson(activeTrack.value)`
  - Visual feedback: button text changes to "Copied!" for 1.5s

### Settings panel (`wizard.js`)
- [ ] Modal overlay: opens from [Settings] button in header
- [ ] Parameters:
  - **Undo depth** — `<input type="number" min="1" max="100">`, default 10
- [ ] [Save] button → `store.settings.undoDepth = value`, `saveSettings()`
- [ ] [Close] button / click outside → close without save
- [ ] Settings loaded from localStorage on app mount (`loadSettings()`)

### localStorage autosave
- [ ] `watch(state, saveSession, { deep: true })` — saves on every state change
- [ ] `saveSession()` serializes full store state to `wizard_session` key
- [ ] `loadSession()` restores and validates — if invalid JSON, clears and starts fresh
- [ ] Session is cleared on "New" action

### Export buttons in header
- [ ] [Export ZIP] — calls `downloadZip(state.value)`
- [ ] No separate "Copy JSON" in header — copying is per-track via JSON drawer

### Final integration
- [ ] End-to-end test: open wizard → load example data → edit a field → export ZIP →
  drop ZIP contents next to `index.html` → widget renders correctly
- [ ] HTTP headers on `wizard.html`: verify cache-control from nginx (1h)

---

## Notes

- `JSZip` CDN: `https://cdn.jsdelivr.net/npm/jszip@3/dist/jszip.min.js`
- The exported `manifest.json` must be identical in structure to `4t-data/example/manifest.json`
  so the widget's `loader.js` accepts it without changes.
- After this stage, Issue #8 Stage 2 (`002-wizard-route.md`) is unblocked:
  `wizard.html` exists and can be served at `https://a1exma.online/wizard`.
