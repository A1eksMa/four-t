# Stage 3: Threads panel + preview navigation sync

**Issue:** #5
**Stage:** 003

---

## Goal

Threads panel is fully functional. Clicking a track bar in the preview switches the
editor to the threads panel for that track. The bidirectional sync between preview
navigation and editor panel is complete.

---

## Checklist

### Preview navigation sync
- [ ] Widget click on track bar → `activePanel = 'threads'`, `activeTrackId = track.id`
- [ ] Widget click on thread bar → `activePanel = 'timeline'`, `activeThreadId = thread.id`
- [ ] Widget breadcrumb click → `activePanel` follows navigation frame type
- [ ] `activeTrackId` shown as context label above the threads panel ("Threads in: {track.name}")

### Threads panel (`panels/threads.js`)
- [ ] Toolbar: [+ Add Thread] [🗑 Delete selected]
- [ ] Thread list filtered by `activeTrackId`
- [ ] Accordion component reused from Stage 2
- [ ] "Add Thread" → push new thread with defaults to active track, open its row
- [ ] "Delete" → confirm → remove thread from track

### Thread edit form (inside accordion row)
- [ ] `name.en` / `name.ru` — text inputs
- [ ] `level` — level slider
- [ ] `status` — toggle: active / archive
- [ ] `on_click` — select: timeline / tools / null
- [ ] `chart.title`, `chart.pre_text`, `chart.post_text` — same as track form
- [ ] `chart.effects.enter` / `chart.effects.exit` — effects-picker
- [ ] `timeline_config.scale` — select: day / week / month / quarter / year
- [ ] `timeline_config.interpolation` — select: step / linear / smooth
- [ ] `timeline_config.edge_before` — select: zero / extend / null
- [ ] `timeline_config.edge_after` — select: zero / extend / null
- [ ] `timeline_config.aggregation` — select: last / max / avg
- [ ] `timeline_config.bar_click` — toggle: tools / null

### Store integration
- [ ] `pushUndo` + mutate + `saveSession` on every field change
- [ ] Thread order: up/down buttons within the track

---

## Notes

- `timeline_config` fields have sensible defaults (see `architecture.md`) — the form
  should show defaults clearly so the user only changes what they need.
- Thread panel is empty when no track is selected in the preview — show a hint:
  "Click a track in the preview to edit its threads."
