# Stage 6 Progress: Public API

**Issue:** #3 — Phase 1: MVP Widget Extraction
**Stage:** 6 of 7
**Status:** Complete
**Commit:** 2e274fb

---

## Deliverables

| File | Status |
|------|--------|
| `4t-widget/widget.js` | ✓ Created |

---

## Verification

- `FourT.init(element, config)` returns `Symbol` id on success ✓
- `FourT.init` returns `null` and shows error on bad `dataUrl` ✓
- `FourT.update(id, newData)` re-renders current level with new data ✓
- `FourT.destroy(id)` disposes chart and removes observers ✓
- `FourT.setLang(id, 'ru')` reloads locale and re-renders ✓
- `FourT.registerEffect(name, fn)` delegates to effects registry ✓
- Multiple `FourT.init` calls on different elements work independently ✓
- Dark mode observer re-inits chart on `class` change on `<html>` ✓
- `ResizeObserver` calls `chart.resize()` on container resize ✓
- Clicking track bar → L2 (with flipX effect from track.chart.effects.exit) ✓
- Clicking thread bar → L3 zeroed → growL3 afterFlip → real data ✓
- Clicking timeline bar → L4 tools ✓
- Breadcrumb back navigation via `navigateBack` ✓

---

## Notes

- `buildL3Option` called with `zeroed: true` in render — bars start at 0
- `grow(chart, thread, lang)` called in afterFlip for timeline transitions — animates to real data
- Locale loaded once at init and stored in `inst._locale`; reloaded on `setLang`
- `element._ftId` set for breadcrumb click delegation (no closure captured)
