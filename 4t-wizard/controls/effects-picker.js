import { defineComponent } from 'vue'

// Dropdown of registered effect names.
// In Stage 5 this will read from effects/registry.js.
// For Stage 2 the list is hardcoded to the four built-in effects.
const EFFECTS = ['none', 'flipX', 'flipY', 'grow']

export const EffectsPicker = defineComponent({
  name: 'EffectsPicker',
  props: {
    modelValue: { type: String, default: 'none' },
  },
  emits: ['update:modelValue'],
  setup() { return { EFFECTS } },
  template: `
    <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
      <option v-for="e in EFFECTS" :key="e" :value="e">{{ e }}</option>
    </select>
  `,
})
