# Stage 4 Progress: Timeline and Tools panels

**Issue:** #5
**Stage:** 004
**Status:** Complete
**Date:** 2026-03-29

---

## Result

Timeline and Tools panels are functional. Full CRUD for timeline points and tool
snapshots. Preview navigation to tools level now captures `periodMs` and highlights
the corresponding snapshot in the Tools panel.

## Checklist

### store.js / wizard.js
- [x] `activeNav.periodMs` added — captured on timeline bar click via `periodToMs`
- [x] `setupNavSync` updated: timeline click resolves `point.period` → `periodToMs` → `activeNav.periodMs`
- [x] Breadcrumb sync updated to preserve/clear `periodMs` by depth

### Timeline panel (`panels/timeline.js`)
- [x] Empty state: "Click a thread in the preview…"
- [x] Toolbar: [+ Add Point] + period format hint (e.g. `2023-Q1`, scale: quarter)
- [x] Table layout: period / level / annotation EN / annotation RU / delete
- [x] Period `@change` → `setPeriod` → `pushUndo` + mutate + auto-sort
- [x] Level: LevelSlider with `@before-change` snap
- [x] Annotation: "+ add" button when null; EN+RU inputs + remove button when set
- [x] Auto-sort by period ascending after every period change (no extra undo entry)

### Tools panel (`panels/tools.js`)
- [x] Empty state: "Click a timeline bar in the preview…"
- [x] Toolbar: [+ Add Snapshot]
- [x] Outer accordion: one row per snapshot, period editable inline in header
- [x] Snapshot shows tool count badge
- [x] Inner table: tool name + LevelSlider per tool + delete button
- [x] `highlightIdx`: computed via `closestSnapIdx` from `activeNav.periodMs` —
  highlighted snapshot shows amber left border + "◀ preview" badge
- [x] Watches `activeNav.periodMs` → auto-opens closest snapshot
- [x] Watches `activeNav.threadId` → resets `openSnapIdx`

### Bug fixed
- `snap()` function renamed to `beforeChange()` in tools.js — avoids naming conflict
  with `snap` loop variable in `v-for="(snap, sIdx) in snapshots"` template.

## Implementation notes

**`closestSnapIdx`:** mirrors the logic of `getToolsAtPeriod` from `scale.js` —
finds the snapshot with the largest `periodMs` that is ≤ the active period.
Invalid period strings are silently skipped (try/catch around `periodToMs`).

**Auto-sort:** `sortTimeline` is called after `setPeriod` without pushing undo.
Since undo already captured the pre-sort state, reverting via undo correctly
restores the unsorted (or differently sorted) state.
