# Stage 5: Scale editor + controls

**Issue:** #5
**Stage:** 005

---

## Goal

The manifest-level scale is editable. All reusable controls (slider, toggle,
color-picker, effects-picker) are fully implemented and integrated across all panels.

---

## Checklist

### Scale editor (accessible from header or tracks panel header)
- [ ] Scale division list: rows of `{ value, label.en, label.ru, desc.en, desc.ru }`
- [ ] Toolbar: [+ Add Division] [🗑 Delete selected]
- [ ] Division row fields: `value` (number), `label.en`, `label.ru`, `desc.en`, `desc.ru`
- [ ] Divisions sorted by `value` ascending (auto-sort)
- [ ] Live preview: slider showing all division labels
- [ ] Scale `min` / `max` inputs
- [ ] Changes update all level sliders across all panels immediately

### `controls/slider.js` (Vue component)
- [ ] Props: `modelValue` (number), `scale` (Scale object)
- [ ] Renders as `<input type="range">` with `min`/`max` from scale
- [ ] Snap to division values (only allow values that exist in `scale.divisions`)
- [ ] Shows division `label` on drag (tooltip or adjacent text)
- [ ] Emits `update:modelValue`

### `controls/toggle.js` (Vue component)
- [ ] Props: `modelValue` (boolean), `label`
- [ ] Renders as checkbox or styled toggle switch
- [ ] When toggled off: parent hides / nulls the associated field

### `controls/color-picker.js` (Vue component)
- [ ] Props: `modelValue` (hex string)
- [ ] Wraps native `<input type="color">`
- [ ] Shows hex value as text alongside the swatch
- [ ] Emits `update:modelValue`

### `controls/effects-picker.js` (Vue component)
- [ ] Props: `modelValue` (effect name string)
- [ ] Renders as `<select>` populated from `effects/registry.js` keys
- [ ] Options: `none`, `flipX`, `flipY`, `grow` (extensible via registry)
- [ ] Emits `update:modelValue`

### Integration pass
- [ ] Replace all placeholder controls in panels 2–4 with real components
- [ ] Verify all panels reflect scale changes immediately after scale edit

---

## Notes

- The scale editor can live as a collapsible section at the top of the tracks panel
  or as a separate tab in the editor area — utilitarian approach: collapsible section
  at the top of tracks panel.
- Track-level scale override (inline `scale` field per track) is a Phase 4+ feature —
  not in scope for this stage. All tracks use the manifest scale in Phase 3.
