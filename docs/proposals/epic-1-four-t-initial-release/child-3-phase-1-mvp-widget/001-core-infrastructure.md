# Stage 1: Core Infrastructure

**Objective:** Create foundational utility modules — no DOM, no ECharts, no data loading
**Duration:** ~1 session
**Dependencies:** None

---

## Step 1.1: `core/option.js`

**Action:** Implement Option monad (Some/None) with `map`, `flatMap`, `getOrElse`, `match`

**Implementation** (full code in `architecture.md → core/option.js`):
```js
export const Some     = value => ({ tag: 'Some', value })
export const None     = ()    => ({ tag: 'None' })
export const map      = (opt, f) => opt.tag === 'Some' ? Some(f(opt.value)) : opt
export const flatMap  = (opt, f) => opt.tag === 'Some' ? f(opt.value) : opt
export const getOrElse = (opt, def) => opt.tag === 'Some' ? opt.value : def
export const match    = patterns => opt => (patterns[opt.tag] ?? patterns['_'])(opt.value)
```

**Verification:** Import in browser console; `getOrElse(None(), 42) === 42`

---

## Step 1.2: `core/result.js`

**Action:** Implement Result monad (Ok/Err) for fetch/parse errors

**Implementation** (full code in `architecture.md → core/result.js`):
```js
export const Ok  = value => ({ tag: 'Ok',  value })
export const Err = error => ({ tag: 'Err', error })
export const mapResult     = (r, f) => r.tag === 'Ok' ? Ok(f(r.value)) : r
export const flatMapResult = (r, f) => r.tag === 'Ok' ? f(r.value) : r
```

**Verification:** `mapResult(Ok(5), x => x * 2).value === 10`

---

## Step 1.3: `core/i18n.js`

**Action:** Implement `resolveField` and `getString` for content and UI string resolution

**Implementation** (full code in `architecture.md → core/i18n.js`):
```js
export const resolveField = (field, lang) =>
  typeof field === 'string' ? field : field?.[lang] ?? field?.['en'] ?? ''

export const getString = (locale, key) => locale?.[key] ?? key
```

**Verification:**
- `resolveField({ en: 'Hello', ru: 'Привет' }, 'ru') === 'Привет'`
- `resolveField({ en: 'Hello' }, 'de') === 'Hello'` (fallback to en)
- `resolveField('Plain string', 'ru') === 'Plain string'`

---

## Step 1.4: `core/scale.js`

**Action:** Implement period parsing and tool lookup functions

**MVP scope** (Phase 2 functions are stubs):
- `periodToMs(scale, period)` — all 5 scale types
- `isoWeekToMs(p)` — helper for week scale
- `resolveScale(manifestScale, track)` — returns effective scale for track
- `getToolsAtPeriod(thread, periodMs)` — finds nearest tool snapshot

Full implementation specified in `architecture.md → core/scale.js`.

**Verification:**
- `periodToMs('quarter', '2023Q1')` returns timestamp for 2023-01-01
- `periodToMs('year', '2023')` returns timestamp for 2023-01-01
- `periodToMs('week', '2023-W01')` returns timestamp for Monday of ISO week 1 2023
- `getToolsAtPeriod(pythonThread, periodMs)` returns correct snapshot

---

## Step 1.5: `i18n/en.json` and `i18n/ru.json`

**Action:** Create UI string locale files covering all widget labels

**Keys to include:**
```json
{
  "hint_l1": "Click a track to see details",
  "hint_l2": "Click a thread to see its timeline",
  "hint_l3": "Click a bar to see tools for that period",
  "hint_l4": "Tools active in this period",
  "breadcrumb_all_tracks": "All tracks",
  "legend_title": "Proficiency scale",
  "no_tools": "No tool data for this period",
  "archive_label": "archive"
}
```

Russian equivalents in `ru.json`.

**Verification:** Both files parse as valid JSON; all keys present in both files

---

## Definition of Done

- All 4 modules and 2 locale files created in `4t-widget/`
- Each module imports cleanly in an ES module context (no errors)
- No DOM dependencies in any file
- Manual spot-checks from verification steps pass
