import { defineComponent, ref, computed } from 'vue'
import { wizardData, pushUndo } from '../store.js'
import { LevelSlider } from '../controls/slider.js'

// ─── ScaleEditor ──────────────────────────────────────────────────────────────
// Collapsible panel section that edits wizardData.scale in place.
// Shows: min/max inputs, divisions table (value / label EN / label RU / desc EN / desc RU),
// add/delete division with auto-sort by value, and a live slider preview.

export const ScaleEditor = defineComponent({
  name: 'ScaleEditor',
  components: { LevelSlider },

  setup() {
    const open        = ref(false)
    const previewVal  = ref(null)   // live slider preview value

    const scale = computed(() => wizardData.value.scale)

    // Ensure wizardData.scale exists with defaults before editing
    function ensureScale() {
      if (!wizardData.value.scale) {
        wizardData.value.scale = { min: 1, max: 10, divisions: [] }
      }
    }

    function set(fn) { pushUndo(); fn() }

    // ── Min / Max ──────────────────────────────────────────────────────────────

    function setMin(val) {
      const n = parseInt(val)
      if (isNaN(n)) return
      set(() => { ensureScale(); wizardData.value.scale.min = n })
    }

    function setMax(val) {
      const n = parseInt(val)
      if (isNaN(n)) return
      set(() => { ensureScale(); wizardData.value.scale.max = n })
    }

    // ── Divisions ─────────────────────────────────────────────────────────────

    function addDivision() {
      pushUndo()
      ensureScale()
      const sc = wizardData.value.scale
      const next = (sc.divisions.length ? Math.max(...sc.divisions.map(d => d.value)) + 1 : 1)
      sc.divisions.push({ value: next, label: { en: '', ru: '' }, desc: { en: '', ru: '' } })
    }

    function deleteDivision(idx) {
      pushUndo()
      wizardData.value.scale.divisions.splice(idx, 1)
    }

    function sortDivisions() {
      wizardData.value.scale.divisions.sort((a, b) => a.value - b.value)
    }

    function setDivValue(idx, raw) {
      const n = parseInt(raw)
      if (isNaN(n)) return
      pushUndo()
      wizardData.value.scale.divisions[idx].value = n
      sortDivisions()
    }

    function setDivField(idx, path, val) {
      // path: 'label.en' | 'label.ru' | 'desc.en' | 'desc.ru'
      pushUndo()
      const [obj, key] = path.split('.')
      wizardData.value.scale.divisions[idx][obj][key] = val
    }

    // ── Preview ───────────────────────────────────────────────────────────────

    // Initialize preview value to current scale min on open
    function toggleOpen() {
      open.value = !open.value
      if (open.value && scale.value) {
        previewVal.value = scale.value.min ?? 1
      }
    }

    return {
      open, toggleOpen, previewVal,
      scale,
      setMin, setMax,
      addDivision, deleteDivision, setDivValue, setDivField,
    }
  },

  template: `
<div class="scale-editor">

  <!-- Collapsible header -->
  <div class="scale-editor-header" @click="toggleOpen">
    <span class="acc-arrow">{{ open ? '▼' : '▶' }}</span>
    <span class="scale-editor-title">Scale</span>
    <span class="scale-editor-summary" v-if="scale">
      {{ scale.min }}–{{ scale.max }}
      <span v-if="scale.divisions?.length"> · {{ scale.divisions.length }} divisions</span>
    </span>
    <span class="scale-editor-summary" v-else>not configured</span>
  </div>

  <div class="scale-editor-body" v-if="open">

    <!-- Min / Max -->
    <div class="form-section">
      <div class="form-section-title">Range</div>
      <div class="field-row">
        <label>Min</label>
        <input type="number" class="scale-num-input"
          :value="scale?.min ?? 1"
          @change="setMin($event.target.value)">
      </div>
      <div class="field-row">
        <label>Max</label>
        <input type="number" class="scale-num-input"
          :value="scale?.max ?? 10"
          @change="setMax($event.target.value)">
      </div>
    </div>

    <!-- Divisions -->
    <div class="form-section">
      <div class="form-section-title" style="display:flex;align-items:center;gap:8px;">
        Divisions
        <button class="btn-tool-sm" @click="addDivision">+ Add</button>
      </div>

      <div class="scale-empty" v-if="!scale?.divisions?.length">
        No divisions — slider will move freely between min and max.
      </div>

      <table class="scale-table" v-else>
        <thead>
          <tr>
            <th>Value</th>
            <th>Label EN</th>
            <th>Label RU</th>
            <th>Desc EN</th>
            <th>Desc RU</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(div, idx) in scale.divisions" :key="idx">
            <td>
              <input type="number" class="tl-input" style="width:60px"
                :value="div.value"
                @change="setDivValue(idx, $event.target.value)">
            </td>
            <td>
              <input type="text" class="tl-input"
                :value="div.label?.en ?? ''"
                @change="setDivField(idx, 'label.en', $event.target.value)">
            </td>
            <td>
              <input type="text" class="tl-input"
                :value="div.label?.ru ?? ''"
                @change="setDivField(idx, 'label.ru', $event.target.value)">
            </td>
            <td>
              <input type="text" class="tl-input"
                :value="div.desc?.en ?? ''"
                @change="setDivField(idx, 'desc.en', $event.target.value)">
            </td>
            <td>
              <input type="text" class="tl-input"
                :value="div.desc?.ru ?? ''"
                @change="setDivField(idx, 'desc.ru', $event.target.value)">
            </td>
            <td>
              <button class="icon-btn danger" @click="deleteDivision(idx)" title="Delete">✕</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Live slider preview -->
    <div class="form-section" v-if="scale">
      <div class="form-section-title">Preview</div>
      <div class="field-row">
        <label>Try slider</label>
        <level-slider
          :model-value="previewVal ?? scale.min ?? 1"
          :scale="scale"
          @update:model-value="previewVal = $event"
        ></level-slider>
      </div>
    </div>

  </div><!-- scale-editor-body -->
</div>
  `,
})
