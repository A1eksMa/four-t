# Stage 2: Tracks panel

**Issue:** #5
**Stage:** 002

---

## Goal

The tracks accordion panel is fully functional. The user can add, delete, reorder,
and edit all track-level fields. Every change immediately updates the preview.

---

## Checklist

### Accordion component (reusable, `panels/accordion.js`)
- [ ] Props: `items` (array), `itemKey`, `itemLabel`
- [ ] Each row: label + expand/collapse toggle
- [ ] Expanded row: `<slot>` for edit form
- [ ] One row open at a time (collapse others on open)
- [ ] Keyboard: Enter/Space toggles, arrow keys navigate rows

### Tracks panel (`panels/tracks.js`)
- [ ] Toolbar: [+ Add Track] [🗑 Delete selected]
- [ ] Track list rendered via accordion component
- [ ] "Add Track" → push new track to store with defaults, open its accordion row
- [ ] "Delete" → confirm → remove track from store

### Track edit form (inside accordion row)
- [ ] `name.en` / `name.ru` — text inputs
- [ ] `color` — color-picker control (`controls/color-picker.js`)
- [ ] `level` — level slider (`controls/slider.js`, bound to manifest scale)
- [ ] `status` — toggle: active / placeholder (`controls/toggle.js`)
- [ ] `on_click` — select: thread / timeline / tools / null
- [ ] `chart.title.en` / `chart.title.ru` — text inputs (with toggle to enable/disable)
- [ ] `chart.pre_text.en` / `chart.pre_text.ru` — textarea (with toggle)
- [ ] `chart.post_text.en` / `chart.post_text.ru` — textarea (with toggle)
- [ ] `chart.effects.enter` — effects-picker (`controls/effects-picker.js`)
- [ ] `chart.effects.exit` — effects-picker

### Store integration
- [ ] Every field change: `pushUndo(snapshot)` before mutation, then mutate, then
  `saveSession()`
- [ ] Track order: drag-to-reorder (HTML5 `draggable`) OR up/down buttons — up/down
  buttons preferred (simpler, no library needed)

### Preview sync
- [ ] Editing any track field triggers `FourT.update()` via existing store watcher
- [ ] Active track in preview highlights the corresponding accordion row

---

## Notes

- `controls/color-picker.js`, `controls/slider.js`, `controls/toggle.js`,
  `controls/effects-picker.js` are scaffolded as minimal Vue components this stage.
  Full implementation in Stage 5.
- Placeholder track renders as dimmed bar in widget — status toggle visually
  confirms the behavior.
