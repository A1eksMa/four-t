# Stage 6 Progress: Export, JSON drawer, settings, localStorage

**Issue:** #5
**Stage:** 006
**Status:** Complete
**Date:** 2026-03-29

---

## Result

ZIP export implemented and wired into the header. All other Stage 6 deliverables
(JSON drawer, settings modal, localStorage autosave/restore) were already functional
from Stages 1–2. Stage 6 completes Issue #5.

## Checklist

### exporter.js (new)
- [x] `buildManifest(data)` — serializes top-level fields + `tracks: [{id, file, order}]`
- [x] `buildTrackFile(track)` — serializes `{ "4t": "1.0", track: {...}, threads: [...] }`
- [x] `exportZip(data)` — builds ZIP via JSZip (window global), triggers browser download
- [x] ZIP filename derived from `meta.title.en`, sanitized; fallback `4t-data.zip`
- [x] `downloadBlob` helper uses `URL.createObjectURL` + synthetic `<a>` click + cleanup

### wizard.js
- [x] Imports `exportZip` from `./exporter.js`
- [x] `handleExport()` — async wrapper with `exportBusy` guard (prevents double-click)
- [x] `exportBusy` ref exposed to template

### wizard.html
- [x] JSZip 3.10.1 added as CDN script tag (required by exporter.js as `window.JSZip`)
- [x] [Export ZIP] button added to header; disabled + text changes while busy
- [x] Button order: Open · New · Export ZIP · Settings · JSON

### Already complete (prior stages)
- [x] JSON drawer: right-side slide-in panel, live `jsonPreview` computed, Copy button
- [x] Settings modal: undo depth input, persisted to `localStorage[wizard_settings]`
- [x] localStorage autosave: `watch(wizardData, saveSession, { deep: true })`
- [x] Restore dialog: Resume / Open file / New on first load with saved session

## Implementation notes

**`buildTrackFile` field list:** Explicitly destructures `id, name, color, level,
status, on_click, scale, chart` from the in-memory track object, dropping `threads`
from the `track` block and writing them separately. Matches the `mergeTrack()` shape
in `loader.js` exactly so the exported ZIP round-trips cleanly through `loadData`.

**JSZip as window global:** The wizard has no bundler. JSZip is loaded via a `<script>`
tag before the module and accessed as `window.JSZip` (implicitly via `new JSZip()`).
This is consistent with how `echarts` is used throughout the widget.
