import { defineComponent, computed } from 'vue'

// Level slider bound to scale divisions.
// Snaps to the nearest division value on drag.
export const LevelSlider = defineComponent({
  name: 'LevelSlider',
  props: {
    modelValue: { type: Number, default: 1 },
    scale:      { type: Object, default: null },
  },
  emits: ['update:modelValue', 'before-change'],

  setup(props, { emit }) {
    const min    = computed(() => props.scale?.min ?? 1)
    const max    = computed(() => props.scale?.max ?? 10)
    const divs   = computed(() => props.scale?.divisions ?? [])

    const label  = computed(() => {
      const div = divs.value.find(d => d.value === props.modelValue)
      return div ? (div.label?.en ?? div.label ?? '') : ''
    })

    // Snap raw slider value to the nearest division value.
    // Falls through to raw value if no divisions defined.
    function snap(raw) {
      if (!divs.value.length) return raw
      return divs.value.reduce((best, d) =>
        Math.abs(d.value - raw) < Math.abs(best.value - raw) ? d : best
      ).value
    }

    function onInput(e) {
      emit('update:modelValue', snap(+e.target.value))
    }

    return { min, max, label, onInput }
  },

  template: `
    <span class="slider-wrap">
      <input
        type="range"
        :min="min"
        :max="max"
        :value="modelValue"
        @mousedown="$emit('before-change')"
        @input="onInput"
      >
      <span class="range-label">{{ modelValue }}{{ label ? ' — ' + label : '' }}</span>
    </span>
  `,
})
