import { defineComponent } from 'vue'

// On/off toggle. Wraps a checkbox with configurable labels.
export const FieldToggle = defineComponent({
  name: 'FieldToggle',
  props: {
    modelValue: { type: Boolean, default: false },
    label:      { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  template: `
    <label class="field-toggle">
      <input
        type="checkbox"
        :checked="modelValue"
        @change="$emit('update:modelValue', $event.target.checked)"
      >
      <span>{{ label }}</span>
    </label>
  `,
})
