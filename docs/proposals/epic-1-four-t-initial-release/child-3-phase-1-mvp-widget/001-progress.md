# Stage 1 Progress: Core Infrastructure

**Issue:** #3 — Phase 1: MVP Widget Extraction
**Stage:** 1 of 7
**Status:** Complete
**Commit:** 1da9d59

---

## Deliverables

| File | Status |
|------|--------|
| `4t-widget/core/option.js` | ✓ Created |
| `4t-widget/core/result.js` | ✓ Created |
| `4t-widget/core/i18n.js` | ✓ Created |
| `4t-widget/core/scale.js` | ✓ Created |
| `4t-widget/i18n/en.json` | ✓ Created |
| `4t-widget/i18n/ru.json` | ✓ Created |

---

## Verification

### Step 1.1 — option.js
- `getOrElse(None(), 42) === 42` ✓
- `getOrElse(Some(7), 42) === 7` ✓
- `map(Some(3), x => x * 2).value === 6` ✓

### Step 1.2 — result.js
- `mapResult(Ok(5), x => x * 2).value === 10` ✓
- `mapResult(Err('oops'), x => x * 2).error === 'oops'` ✓

### Step 1.3 — i18n.js
- `resolveField({ en: 'Hello', ru: 'Привет' }, 'ru') === 'Привет'` ✓
- `resolveField({ en: 'Hello' }, 'de') === 'Hello'` (fallback to en) ✓
- `resolveField('Plain string', 'ru') === 'Plain string'` ✓

### Step 1.4 — scale.js
- `periodToMs('quarter', '2023Q1')` → timestamp for 2023-01-01 ✓
- `periodToMs('year', '2023')` → timestamp for 2023-01-01 ✓
- `periodToMs('week', '2023-W01')` → timestamp for Monday of ISO week 1 2023 ✓
- `resolveScale(manifestScale, trackWithOverride)` returns track scale ✓
- `resolveScale(manifestScale, trackWithoutOverride)` returns manifest scale ✓

### Step 1.5 — locale files
- `en.json`: 8 keys, valid JSON ✓
- `ru.json`: 8 keys, valid JSON, all keys present ✓

---

## Notes

- `scale.js` imports `Some`/`getOrElse` from `option.js` as specified in architecture.md
- Phase 2 functions (`normalizeTimeline`, `aggregateTimeline`, `applyEdges`) are intentionally omitted — deferred per spec
- No DOM dependencies in any module
