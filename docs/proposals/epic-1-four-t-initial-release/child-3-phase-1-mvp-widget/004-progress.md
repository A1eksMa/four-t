# Stage 4 Progress: Effects

**Issue:** #3 — Phase 1: MVP Widget Extraction
**Stage:** 4 of 7
**Status:** Complete
**Commit:** 7a4c059

---

## Deliverables

| File | Status |
|------|--------|
| `4t-widget/effects/none.js` | ✓ Created |
| `4t-widget/effects/flipX.js` | ✓ Created |
| `4t-widget/effects/flipY.js` | ✓ Created |
| `4t-widget/effects/grow.js` | ✓ Created |
| `4t-widget/effects/registry.js` | ✓ Created |

---

## Verification

- `applyEffect('none', dom, cb)` calls `cb()` synchronously ✓
- `applyEffect('unknown', dom, cb)` falls back to `none`, no error ✓
- `effectNames()` returns `['flipX', 'flipY', 'grow', 'none']` ✓
- `flipX` / `flipY` apply CSS transform sequence on dom element ✓
- `grow.js` calls `buildL3Option` with `zeroed: false` and `chart.setOption` ✓

---

## Notes

- `flipX` uses centre pivot (`dom.offsetWidth / 2`) for MVP — click-position pivot deferred per spec
- `grow.js` imports from `charts/L3_timeline.js` (Stage 5) — circular only at runtime, not at module parse time
- `grow` is registered in the registry (for `effectNames()`) but called directly from widget.js, not via `applyEffect`
