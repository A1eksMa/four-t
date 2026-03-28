# Stage 5 Progress: Chart Builders

**Issue:** #3 — Phase 1: MVP Widget Extraction
**Stage:** 5 of 7
**Status:** Complete
**Commit:** f4cb0b8

---

## Deliverables

| File | Status |
|------|--------|
| `4t-widget/core/color.js` | ✓ Created |
| `4t-widget/charts/L1_tracks.js` | ✓ Created |
| `4t-widget/charts/L2_threads.js` | ✓ Created |
| `4t-widget/charts/L3_timeline.js` | ✓ Created |
| `4t-widget/charts/L4_tools.js` | ✓ Created |

---

## Verification

### L1_tracks
- Placeholder tracks: value `0.4`, `opacity: 0.22`, emphasis disabled ✓
- Active tracks: use `track.color` from data ✓
- Bar labels show level value above bar ✓

### L2_threads
- Threads sorted by `level` descending ✓
- Archive threads at `opacity: 0.42` ✓
- `shade(color, i, total)` produces gradient across bars ✓

### L3_timeline
- `zeroed: true` → all yData values are 0 ✓
- `zeroed: false` → real timeline levels ✓
- Annotations rendered as markPoint labels (white bg, border) ✓
- `dataZoom` — inside + slider ✓
- Time axis uses `periodToMs(scale, period)` ✓
- `interpolation: 'smooth'` → line uses `smooth: true` ✓

### L4_tools
- `getToolsAtPeriod` resolves correct snapshot ✓
- Empty tools → `graphic` text element with `no_tools` string ✓
- Bubble layout: `cols = ceil(sqrt(n))`, `rows = ceil(n/cols)` ✓
- Symbol size: `level * 18`, minimum 36px ✓
- Labels: tool name + level, white bold ✓

---

## Notes

- `color.js` extracted as shared module (used by L1 and L2)
- L4 accepts `locale` as optional 4th argument (defaults to `{}`) for `no_tools` string
- L3 annotations use `markPoint` with `symbol: 'none'` to avoid marker icons
