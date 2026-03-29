# Stage 2 Progress: Tracks panel

**Issue:** #5
**Stage:** 002
**Status:** Complete
**Date:** 2026-03-29

---

## Result

The tracks accordion panel is fully functional. All track-level fields are editable.
Every change immediately updates the preview widget via the existing store watcher.

## Checklist

### Controls (scaffolded, finalized in Stage 5)
- [x] `controls/color-picker.js` — native `<input type="color">` + hex label
- [x] `controls/slider.js` — `<input type="range">` with min/max from scale, division label
- [x] `controls/toggle.js` — `FieldToggle` checkbox wrapper
- [x] `controls/effects-picker.js` — `<select>` with hardcoded built-in effects

### Tracks panel (`panels/tracks.js`)
- [x] Toolbar: [+ Add Track]
- [x] Track list rendered as accordion
- [x] "Add Track" → new track pushed to store with defaults, accordion row opened
- [x] Delete track (with confirm dialog)
- [x] Move up / Move down buttons

### Track edit form
- [x] `name.en` / `name.ru` — text inputs
- [x] `color` — ColorPicker (live update on drag)
- [x] `level` — LevelSlider (live update on drag, shows division label)
- [x] `status` — checkbox toggle (active / placeholder)
- [x] `on_click` — select (thread / timeline / tools / null)
- [x] `chart.title` — toggle + EN/RU text inputs
- [x] `chart.pre_text` — toggle + EN/RU textareas
- [x] `chart.post_text` — toggle + EN/RU textareas
- [x] `chart.effects.enter` / `.exit` — EffectsPicker dropdowns

### Store integration
- [x] `pushUndo()` before every field mutation
- [x] `@mousedown` / `@before-change` events for sliders and color pickers
  (undo snapshot taken before drag starts, live updates flow freely)
- [x] `@change` on text inputs (undo per blur/enter, not per keystroke)
- [x] Reactivity: all mutations trigger existing `watch(wizardData)` → `FourT.update()`

### Preview sync
- [x] `watch(activeNav.trackId)` → opens corresponding accordion row
- [x] TracksPanel shown only when `activeNav.panel === 'tracks'`

## Implementation notes

**Undo pattern:** Two distinct strategies:
- Text inputs: `pushUndo()` on `@change` (after user finishes editing, before commit)
- Color/slider: `@before-change` / `@mousedown` emits `pushUndo()` before drag starts,
  then live `@input` updates flow without additional undo entries

**`ensureChart`:** Tracks start with `chart: null`. Before setting any chart field,
`ensureChart(track)` initializes the object with null text fields and default effects.
`toggleChartField` sets the field to `{ en: '', ru: '' }` or back to `null`.

**Component registration:** `TracksPanel` registered globally via
`app.component('TracksPanel', TracksPanel)` in `wizard.js` before `app.mount()`.
