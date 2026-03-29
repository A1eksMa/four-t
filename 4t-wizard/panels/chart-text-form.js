import { defineComponent } from 'vue'
import { pushUndo } from '../store.js'
import { toggleChartField, ensureChartField } from './form-helpers.js'

// Reusable chart text block (title, pre-text, post-text with toggles).
// Used by both TracksPanel and ThreadsPanel.
// Props: entity — the track or thread object (mutated directly).
export const ChartTextForm = defineComponent({
  name: 'ChartTextForm',
  props: { entity: { type: Object, required: true } },
  setup() {
    function set(fn) { pushUndo(); fn() }
    return { set, toggleChartField, ensureChartField }
  },
  template: `
<div>
  <!-- Title -->
  <div class="field-section">
    <div class="field-toggle-row">
      <input type="checkbox" :checked="!!entity.chart?.title"
        @change="toggleChartField(entity, 'title')">
      <span class="toggle-label">Title</span>
    </div>
    <template v-if="entity.chart?.title">
      <div class="field-row">
        <label>EN</label>
        <input type="text" :value="entity.chart.title.en"
          @change="set(() => { ensureChartField(entity, 'title'); entity.chart.title.en = $event.target.value })">
      </div>
      <div class="field-row">
        <label>RU</label>
        <input type="text" :value="entity.chart.title.ru"
          @change="set(() => { ensureChartField(entity, 'title'); entity.chart.title.ru = $event.target.value })">
      </div>
    </template>
  </div>

  <!-- Pre-text -->
  <div class="field-section">
    <div class="field-toggle-row">
      <input type="checkbox" :checked="!!entity.chart?.pre_text"
        @change="toggleChartField(entity, 'pre_text')">
      <span class="toggle-label">Pre-text</span>
    </div>
    <template v-if="entity.chart?.pre_text">
      <div class="field-row">
        <label>EN</label>
        <textarea :value="entity.chart.pre_text.en"
          @change="set(() => { ensureChartField(entity, 'pre_text'); entity.chart.pre_text.en = $event.target.value })"></textarea>
      </div>
      <div class="field-row">
        <label>RU</label>
        <textarea :value="entity.chart.pre_text.ru"
          @change="set(() => { ensureChartField(entity, 'pre_text'); entity.chart.pre_text.ru = $event.target.value })"></textarea>
      </div>
    </template>
  </div>

  <!-- Post-text -->
  <div class="field-section">
    <div class="field-toggle-row">
      <input type="checkbox" :checked="!!entity.chart?.post_text"
        @change="toggleChartField(entity, 'post_text')">
      <span class="toggle-label">Post-text</span>
    </div>
    <template v-if="entity.chart?.post_text">
      <div class="field-row">
        <label>EN</label>
        <textarea :value="entity.chart.post_text.en"
          @change="set(() => { ensureChartField(entity, 'post_text'); entity.chart.post_text.en = $event.target.value })"></textarea>
      </div>
      <div class="field-row">
        <label>RU</label>
        <textarea :value="entity.chart.post_text.ru"
          @change="set(() => { ensureChartField(entity, 'post_text'); entity.chart.post_text.ru = $event.target.value })"></textarea>
      </div>
    </template>
  </div>
</div>
  `,
})
