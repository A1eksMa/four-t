import { defineComponent } from 'vue'

// Minimal color picker — full implementation in Stage 5.
// Wraps native <input type="color"> and shows the hex value as text.
export const ColorPicker = defineComponent({
  name: 'ColorPicker',
  props: {
    modelValue: { type: String, default: '#4a7cf7' },
  },
  emits: ['update:modelValue', 'before-change'],
  template: `
    <span class="color-picker-wrap">
      <input
        type="color"
        :value="modelValue"
        @mousedown="$emit('before-change')"
        @input="$emit('update:modelValue', $event.target.value)"
      >
      <span class="hex-label">{{ modelValue }}</span>
    </span>
  `,
})
