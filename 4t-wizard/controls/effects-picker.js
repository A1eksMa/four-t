import { defineComponent } from 'vue'
import { effectNames } from '../../4t-widget/effects/registry.js'

// Dropdown of registered effect names, read live from the effects registry.
export const EffectsPicker = defineComponent({
  name: 'EffectsPicker',
  props: {
    modelValue: { type: String, default: 'none' },
  },
  emits: ['update:modelValue'],
  setup() { return { EFFECTS: effectNames() } },
  template: `
    <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
      <option v-for="e in EFFECTS" :key="e" :value="e">{{ e }}</option>
    </select>
  `,
})
