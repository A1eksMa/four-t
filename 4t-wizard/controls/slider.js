import { defineComponent, computed } from 'vue'

// Level slider bound to scale min/max.
// Emits before-change on mousedown (for undo snapshotting).
// Full division snapping in Stage 5.
export const LevelSlider = defineComponent({
  name: 'LevelSlider',
  props: {
    modelValue: { type: Number, default: 1 },
    scale: { type: Object, default: null },
  },
  emits: ['update:modelValue', 'before-change'],
  setup(props) {
    const min   = computed(() => props.scale?.min ?? 1)
    const max   = computed(() => props.scale?.max ?? 10)
    const label = computed(() => {
      const div = props.scale?.divisions?.find(d => d.value === props.modelValue)
      return div ? (div.label?.en ?? div.label ?? '') : ''
    })
    return { min, max, label }
  },
  template: `
    <span class="slider-wrap">
      <input
        type="range"
        :min="min"
        :max="max"
        :value="modelValue"
        @mousedown="$emit('before-change')"
        @input="$emit('update:modelValue', +$event.target.value)"
      >
      <span class="range-label">{{ modelValue }}{{ label ? ' — ' + label : '' }}</span>
    </span>
  `,
})
