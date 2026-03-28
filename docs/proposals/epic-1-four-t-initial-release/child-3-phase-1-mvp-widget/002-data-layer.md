# Stage 2: Data Layer

**Objective:** Implement `loader.js` — fetch manifest.json + track files → `LoadedData`
**Duration:** ~0.5 session
**Dependencies:** Stage 1 (result.js, scale.js)

---

## Step 2.1: `core/loader.js`

**Action:** Implement the data loading pipeline

**Logic:**
1. `fetch(manifestUrl)` → parse JSON → `Result<ManifestJson>`
2. `Promise.all(tracks.map(t => fetch(t.file)))` → `Result<TrackJson>[]`
3. Merge into `LoadedData` — fill in defaults for optional fields

**Key rules:**
- All fetch errors wrapped in `Err(...)`, never thrown
- `timeline_config` defaults filled in loader (not in callers):
  ```
  scale: 'quarter', interpolation: 'smooth',
  edge_before: 'zero', edge_after: 'extend',
  aggregation: 'last', bar_click: 'tools'
  ```
- Track files fetched relative to manifest URL directory
- `"4t"` version field checked; mismatch logs a console warning (does not abort)

**Signature:**
```js
// loadData(manifestUrl: string) => Promise<Result<LoadedData>>
export const loadData = async (manifestUrl) => { ... }
```

**Implementation sketch:**
```js
export const loadData = async (manifestUrl) => {
  const baseUrl  = manifestUrl.slice(0, manifestUrl.lastIndexOf('/') + 1)
  const manifest = await fetchJson(manifestUrl)
  if (manifest.tag === 'Err') return manifest

  const trackResults = await Promise.all(
    manifest.value.tracks.map(t => fetchJson(baseUrl + t.file))
  )
  const errored = trackResults.find(r => r.tag === 'Err')
  if (errored) return errored

  return Ok(merge(manifest.value, trackResults.map(r => r.value)))
}

const fetchJson = async url => {
  try {
    const res = await fetch(url)
    if (!res.ok) return Err(`HTTP ${res.status}: ${url}`)
    return Ok(await res.json())
  } catch (e) {
    return Err(e.message)
  }
}
```

**Verification:**
- Load `4t-data/example/manifest.json` in a browser
- `loadData('./4t-data/example/manifest.json')` resolves to `Ok(LoadedData)`
- `LoadedData.tracks` has 5 entries
- `LoadedData.tracks[0].threads` has 9 entries (languages)
- `LoadedData.tracks[0].threads[0].timeline_config` has all defaults filled

---

## Step 2.2: Verify example data against LoadedData contract

**Action:** Manually verify that the example files satisfy all required fields

**Checklist:**
- [ ] `manifest.json` has `4t`, `scale`, `tracks[]` with `id` + `file`
- [ ] `languages.json` has `track.id`, `track.color`, `track.level`, `threads[]`
- [ ] Each thread has `id`, `name`, `level`, `timeline[]` with `period` + `level`
- [ ] At least one thread has `tools[]` with `period` + `snapshot[]`
- [ ] Tool snapshot entries have `name` and `level`

---

## Definition of Done

- `loader.js` created in `4t-widget/core/`
- `loadData()` resolves to `Ok(LoadedData)` for the example manifest
- All `timeline_config` defaults filled by loader
- Network error returns `Err(...)`, not throws
