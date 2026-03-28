# Stage 2 Progress: Data Layer

**Issue:** #3 — Phase 1: MVP Widget Extraction
**Stage:** 2 of 7
**Status:** Complete
**Commit:** fd95b90

---

## Deliverables

| File | Status |
|------|--------|
| `4t-widget/core/loader.js` | ✓ Created |

---

## Verification

### Step 2.1 — loader.js

- `loadData('./4t-data/example/manifest.json')` resolves to `Ok(LoadedData)` ✓
- `LoadedData.tracks.length === 5` ✓ (languages, data, infra, systems, foundations)
- `LoadedData.tracks[0].threads.length === 9` ✓ (languages track)
- `LoadedData.tracks[0].threads[0].timeline_config` has all 6 defaults filled ✓
- Network error (bad URL) returns `Err(...)`, does not throw ✓
- HTTP error (404) returns `Err('HTTP 404: ...')`, does not throw ✓
- Unknown schema version logs `console.warn`, does not abort ✓

### Step 2.2 — example data against LoadedData contract

- `manifest.json`: `4t`, `scale`, `tracks[]` with `id` + `file` ✓
- `languages.json`: `track.id`, `track.color`, `track.level`, `threads[]` ✓
- Each thread: `id`, `name`, `level`, `timeline[]` with `period` + `level` ✓
- `python` thread has `tools[]` with `period` + `snapshot[]` ✓
- Tool snapshot entries have `name` and `level` ✓

---

## Notes

- `fillThreadDefaults` spreads incoming `timeline_config` over defaults — partial configs in data files are safe
- `mergeTrack` ignores manifest `order` field (used only for fetch ordering, which matches array index)
- Placeholder tracks (`data.json`, `infra.json`, etc.) load without error — `threads: []` is valid
