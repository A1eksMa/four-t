# Stage 5 Progress: Scale editor + controls finalization

**Issue:** #5
**Stage:** 005
**Status:** Complete
**Date:** 2026-03-29

---

## Result

Scale editor added as a collapsible section at the top of the Tracks panel.
All slider instances now snap to scale divisions. EffectsPicker reads effect names
live from the widget's effect registry instead of a hardcoded list.

## Checklist

### controls/effects-picker.js
- [x] Removed hardcoded `EFFECTS` array
- [x] Now imports `effectNames()` from `4t-widget/effects/registry.js`
- [x] Effect list populated at component setup time from live registry

### controls/slider.js
- [x] `snap(raw)` function snaps to nearest division value when divisions defined
- [x] Falls through to raw value when no divisions configured
- [x] `onInput` emits snapped value; `before-change` undo trigger unchanged

### panels/scale-editor.js (new)
- [x] Collapsible header: shows "▶ Scale  min–max · N divisions" summary when closed
- [x] Range section: min/max number inputs with `@change` → `pushUndo` + mutate
- [x] Divisions table: value / label EN / label RU / desc EN / desc RU / delete
- [x] `setDivValue` auto-sorts divisions by value after every value change
- [x] `addDivision` inserts new row at max+1 with blank labels
- [x] `deleteDivision` removes row by index
- [x] `ensureScale()` guard: creates default scale object if wizardData.scale is null
- [x] Live slider preview (read-only undo, local `previewVal`) at bottom

### panels/tracks.js
- [x] Imports and registers `ScaleEditor`
- [x] `<scale-editor>` rendered above the toolbar in the tracks panel template

### wizard.js
- [x] `ScaleEditor` imported and registered as global app component

### wizard.html
- [x] CSS added: `.scale-editor`, `.scale-editor-header`, `.scale-editor-body`,
  `.scale-editor-title`, `.scale-editor-summary`, `.scale-num-input`,
  `.scale-empty`, `.scale-table`

## Implementation notes

**`ensureScale()`:** Called before every mutation that touches `wizardData.scale`.
Creates `{ min: 1, max: 10, divisions: [] }` if `wizardData.value.scale` is null,
so the scale editor is safe to use even on datasets loaded without a scale block.

**Division sort:** `sortDivisions()` sorts in-place after `setDivValue()` without
pushing a separate undo entry. The pre-sort state is already captured by `pushUndo()`
at the start of `setDivValue()`, matching the same pattern used in TimelinePanel.

**Preview slider:** Uses local `previewVal` ref; does not push undo. Initialized
to `scale.min` on open. Passes the live scale object so snapping reflects edits
made during the same session.
