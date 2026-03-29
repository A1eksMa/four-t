# Stage 3 Progress: Threads panel + preview navigation sync

**Issue:** #5
**Stage:** 003
**Status:** Complete
**Date:** 2026-03-29

---

## Result

Threads panel is fully functional. Clicking a track in the preview switches the editor
to the threads panel for that track. Clicking a thread opens its accordion row.
All thread fields are editable with live preview sync.

## Checklist

### Preview navigation sync
- [x] Track click → `activeNav.panel = 'threads'`, `activeNav.trackId` set (Stage 1 watcher)
- [x] Thread click → `activeNav.panel = 'timeline'`, `activeNav.threadId` set (Stage 1 watcher)
- [x] Breadcrumb back → panel follows nav depth (Stage 1 watcher)
- [x] ThreadsPanel watches `activeNav.threadId` → opens corresponding accordion row
- [x] ThreadsPanel watches `activeNav.trackId` → resets `openId` on track change

### Threads panel (`panels/threads.js`)
- [x] Empty state when no track selected: "Click a track in the preview…"
- [x] Toolbar: [+ Add Thread]
- [x] Thread list filtered by `activeTrack`
- [x] Accordion (same pattern as TracksPanel)
- [x] Add thread → defaults, open its row
- [x] Delete thread (with confirm)
- [x] Move up / Move down

### Thread edit form
- [x] `name.en` / `name.ru`
- [x] `level` — LevelSlider
- [x] `status` — active / archive toggle
- [x] `on_click` — timeline / tools / null
- [x] `timeline_config.scale` — day/week/month/quarter/year
- [x] `timeline_config.interpolation` — step/linear/smooth
- [x] `timeline_config.edge_before` — zero/extend/null
- [x] `timeline_config.edge_after` — zero/extend/null
- [x] `timeline_config.aggregation` — last/max/avg
- [x] `timeline_config.bar_click` — tools/null toggle
- [x] Chart text (via ChartTextForm component)
- [x] Effects enter/exit (EffectsPicker)

### Refactor (part of this stage)
- [x] Extracted `form-helpers.js` — shared `ensureChart`, `toggleChartField`,
  `ensureChartField`, `setEffect`
- [x] Created `chart-text-form.js` — reusable Vue component for title/pre/post-text block
- [x] Refactored `tracks.js` to use ChartTextForm and form-helpers (removed ~60 lines of duplication)

## Implementation notes

**`ensureTlConfig`:** New threads receive `timeline_config` with full defaults. Existing
threads loaded from example data already have `timeline_config` filled by the loader.
`ensureTlConfig` guards against edge cases (e.g. manually crafted JSON without the field).

**Select default labels:** Each `<select>` option for a default value is labelled
"(default)" to make the schema defaults visible to the user without them needing to
check the documentation.
