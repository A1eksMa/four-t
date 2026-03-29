# Stage 4: Timeline and Tools panels

**Issue:** #5
**Stage:** 004

---

## Goal

Timeline and Tools panels are functional. The user can add, edit, and delete timeline
points and tool snapshots. Clicking a thread bar in the preview switches to the
timeline panel; clicking a timeline bar switches to the tools panel.

---

## Checklist

### Timeline panel (`panels/timeline.js`)
- [ ] Context label: "Timeline: {track.name} → {thread.name}"
- [ ] Toolbar: [+ Add Point] [🗑 Delete selected]
- [ ] Table layout: rows of `{ period, level, annotation }`
  - `period` — text input (format depends on `timeline_config.scale`, show format hint)
  - `level` — level slider
  - `annotation.en` / `annotation.ru` — text inputs (with toggle to enable/disable)
- [ ] Rows sorted by period ascending (auto-sort on period change)
- [ ] "Add Point" → append row with empty defaults, focus period input
- [ ] "Delete" → remove row
- [ ] Empty state hint: "Click a thread in the preview to edit its timeline."

### Tools panel (`panels/tools.js`)
- [ ] Context label: "Tools: {track.name} → {thread.name} @ {period}"
- [ ] Two-level structure: snapshot list (outer accordion) → tool list per snapshot
- [ ] **Snapshot level toolbar:** [+ Add Snapshot] [🗑 Delete snapshot]
- [ ] Snapshot row shows `period` as label
  - `period` — text input in accordion header (editable inline)
- [ ] **Tool level (inside expanded snapshot):**
  - Toolbar: [+ Add Tool] [🗑 Delete tool]
  - Tool row: `name` (text input) + `level` (level slider)
- [ ] Empty state hint: "Click a timeline bar in the preview to view tools for that period."

### Preview navigation sync
- [ ] Widget click on thread bar → `activePanel = 'timeline'`, `activeThreadId`
- [ ] Widget click on timeline bar → `activePanel = 'tools'`, `activePeriodMs`
- [ ] Tools panel: on `activePeriodMs` change, highlight the snapshot closest to
  that period (same logic as `getToolsAtPeriod` in `scale.js`)

### Store integration
- [ ] `pushUndo` + mutate + `saveSession` on every change
- [ ] Timeline auto-sort does not push undo (it is a derived operation)

---

## Notes

- Period format hint examples by scale:
  - `quarter` → "2023-Q1"
  - `year` → "2023"
  - `month` → "2023-01"
  - `week` → "2023-W01"
  - `day` → "2023-01-15"
- The tools panel's "active period" from the preview is informational — the user
  can still edit any snapshot regardless of which period is selected in preview.
