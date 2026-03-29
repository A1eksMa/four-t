import { defineComponent, ref, computed, watch } from 'vue'
import { wizardData, activeNav, pushUndo } from '../store.js'
import { ColorPicker }  from '../controls/color-picker.js'
import { LevelSlider }  from '../controls/slider.js'
import { EffectsPicker } from '../controls/effects-picker.js'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const newTrack = () => ({
  id:       `track-${Date.now()}`,
  name:     { en: 'New Track', ru: 'Новый трек' },
  color:    '#4a7cf7',
  level:    5,
  status:   'active',
  on_click: 'thread',
  scale:    null,
  chart:    null,
  threads:  [],
})

function ensureChart(track) {
  if (!track.chart) {
    track.chart = {
      title:     null,
      pre_text:  null,
      post_text: null,
      effects:   { enter: 'none', exit: 'none' },
    }
  }
  if (!track.chart.effects) {
    track.chart.effects = { enter: 'none', exit: 'none' }
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export const TracksPanel = defineComponent({
  name: 'TracksPanel',
  components: { ColorPicker, LevelSlider, EffectsPicker },

  setup() {
    const openId = ref(null)
    const tracks = computed(() => wizardData.value.tracks)
    const scale  = computed(() => wizardData.value.scale)

    // Sync accordion open row with preview navigation
    watch(() => activeNav.value.trackId, id => {
      if (id) openId.value = id
    })

    function toggle(id) {
      openId.value = openId.value === id ? null : id
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    function addTrack() {
      pushUndo()
      const t = newTrack()
      wizardData.value.tracks.push(t)
      openId.value = t.id
    }

    function deleteTrack(id) {
      if (!confirm('Delete this track and all its threads?')) return
      pushUndo()
      const idx = wizardData.value.tracks.findIndex(t => t.id === id)
      if (idx !== -1) wizardData.value.tracks.splice(idx, 1)
      if (openId.value === id) openId.value = null
    }

    function moveUp(idx) {
      if (idx === 0) return
      pushUndo()
      const arr = wizardData.value.tracks
      const tmp = arr[idx - 1]; arr[idx - 1] = arr[idx]; arr[idx] = tmp
    }

    function moveDown(idx) {
      const arr = wizardData.value.tracks
      if (idx >= arr.length - 1) return
      pushUndo()
      const tmp = arr[idx + 1]; arr[idx + 1] = arr[idx]; arr[idx] = tmp
    }

    // ── Field mutations ───────────────────────────────────────────────────────

    // Called on text field @change — captures undo BEFORE committing new value.
    function set(fn) {
      pushUndo()
      fn()
    }

    // Called on slider/color @mousedown — captures undo BEFORE dragging starts.
    // The actual update flows through @input directly (no extra pushUndo needed).
    function snap() { pushUndo() }

    function toggleChartField(track, field) {
      pushUndo()
      ensureChart(track)
      track.chart[field] = track.chart[field] ? null : { en: '', ru: '' }
    }

    function ensureChartField(track, field) {
      ensureChart(track)
      if (!track.chart[field]) track.chart[field] = { en: '', ru: '' }
    }

    function setEffect(track, dir, val) {
      ensureChart(track)
      track.chart.effects[dir] = val
    }

    // on_click field
    const ON_CLICK_OPTIONS = [
      { value: 'thread',   label: 'Thread' },
      { value: 'timeline', label: 'Timeline' },
      { value: 'tools',    label: 'Tools' },
      { value: null,       label: '(none — not clickable)' },
    ]

    return {
      openId, tracks, scale,
      toggle, addTrack, deleteTrack, moveUp, moveDown,
      set, snap,
      toggleChartField, ensureChartField, setEffect,
      ON_CLICK_OPTIONS,
    }
  },

  template: `
<div class="tracks-panel">

  <!-- Toolbar -->
  <div class="panel-toolbar">
    <button class="btn-tool" @click="addTrack">+ Add Track</button>
  </div>

  <!-- Empty state -->
  <div class="panel-empty" v-if="tracks.length === 0">
    No tracks yet. Click "Add Track" to start.
  </div>

  <!-- Accordion -->
  <div class="acc-row" v-for="(track, idx) in tracks" :key="track.id">

    <!-- Row header -->
    <div class="acc-header" @click="toggle(track.id)" :class="{ open: openId === track.id }">
      <span class="acc-arrow">{{ openId === track.id ? '▼' : '▶' }}</span>
      <span class="color-dot" :style="{ background: track.color }"></span>
      <span class="acc-label">{{ track.name?.en || track.id }}</span>
      <span class="acc-badge" v-if="track.status === 'placeholder'">placeholder</span>
      <button class="icon-btn" @click.stop="moveUp(idx)"   :disabled="idx === 0"              title="Move up">↑</button>
      <button class="icon-btn" @click.stop="moveDown(idx)" :disabled="idx === tracks.length - 1" title="Move down">↓</button>
      <button class="icon-btn danger" @click.stop="deleteTrack(track.id)" title="Delete">✕</button>
    </div>

    <!-- Edit form -->
    <div class="acc-body" v-if="openId === track.id">

      <!-- Identity -->
      <div class="form-section">
        <div class="form-section-title">Identity</div>

        <div class="field-row">
          <label>Name EN</label>
          <input type="text" :value="track.name?.en" @change="set(() => track.name.en = $event.target.value)">
        </div>
        <div class="field-row">
          <label>Name RU</label>
          <input type="text" :value="track.name?.ru" @change="set(() => track.name.ru = $event.target.value)">
        </div>
        <div class="field-row">
          <label>Color</label>
          <color-picker
            :model-value="track.color"
            @before-change="snap()"
            @update:model-value="track.color = $event"
          ></color-picker>
        </div>
        <div class="field-row">
          <label>Status</label>
          <label class="field-toggle">
            <input type="checkbox"
              :checked="track.status === 'active'"
              @change="set(() => track.status = $event.target.checked ? 'active' : 'placeholder')"
            >
            <span>{{ track.status === 'active' ? 'Active' : 'Placeholder (dimmed, non-clickable)' }}</span>
          </label>
        </div>
      </div>

      <!-- Behavior -->
      <div class="form-section">
        <div class="form-section-title">Behavior</div>

        <div class="field-row">
          <label>Level</label>
          <level-slider
            :model-value="track.level"
            :scale="scale"
            @before-change="snap()"
            @update:model-value="track.level = $event"
          ></level-slider>
        </div>
        <div class="field-row">
          <label>On click</label>
          <select :value="track.on_click ?? 'null'"
            @change="set(() => track.on_click = $event.target.value === 'null' ? null : $event.target.value)">
            <option value="thread">Thread</option>
            <option value="timeline">Timeline</option>
            <option value="tools">Tools</option>
            <option value="null">(none — not clickable)</option>
          </select>
        </div>
      </div>

      <!-- Chart text -->
      <div class="form-section">
        <div class="form-section-title">Chart text</div>

        <!-- Title -->
        <div class="field-section">
          <div class="field-toggle-row">
            <input type="checkbox"
              :checked="!!track.chart?.title"
              @change="toggleChartField(track, 'title')"
            >
            <span class="toggle-label">Title</span>
          </div>
          <template v-if="track.chart?.title">
            <div class="field-row">
              <label>EN</label>
              <input type="text" :value="track.chart.title.en"
                @change="set(() => { ensureChartField(track, 'title'); track.chart.title.en = $event.target.value })">
            </div>
            <div class="field-row">
              <label>RU</label>
              <input type="text" :value="track.chart.title.ru"
                @change="set(() => { ensureChartField(track, 'title'); track.chart.title.ru = $event.target.value })">
            </div>
          </template>
        </div>

        <!-- Pre-text -->
        <div class="field-section">
          <div class="field-toggle-row">
            <input type="checkbox"
              :checked="!!track.chart?.pre_text"
              @change="toggleChartField(track, 'pre_text')"
            >
            <span class="toggle-label">Pre-text</span>
          </div>
          <template v-if="track.chart?.pre_text">
            <div class="field-row">
              <label>EN</label>
              <textarea :value="track.chart.pre_text.en"
                @change="set(() => { ensureChartField(track, 'pre_text'); track.chart.pre_text.en = $event.target.value })"></textarea>
            </div>
            <div class="field-row">
              <label>RU</label>
              <textarea :value="track.chart.pre_text.ru"
                @change="set(() => { ensureChartField(track, 'pre_text'); track.chart.pre_text.ru = $event.target.value })"></textarea>
            </div>
          </template>
        </div>

        <!-- Post-text -->
        <div class="field-section">
          <div class="field-toggle-row">
            <input type="checkbox"
              :checked="!!track.chart?.post_text"
              @change="toggleChartField(track, 'post_text')"
            >
            <span class="toggle-label">Post-text</span>
          </div>
          <template v-if="track.chart?.post_text">
            <div class="field-row">
              <label>EN</label>
              <textarea :value="track.chart.post_text.en"
                @change="set(() => { ensureChartField(track, 'post_text'); track.chart.post_text.en = $event.target.value })"></textarea>
            </div>
            <div class="field-row">
              <label>RU</label>
              <textarea :value="track.chart.post_text.ru"
                @change="set(() => { ensureChartField(track, 'post_text'); track.chart.post_text.ru = $event.target.value })"></textarea>
            </div>
          </template>
        </div>
      </div>

      <!-- Effects -->
      <div class="form-section">
        <div class="form-section-title">Transition effects</div>
        <div class="field-row">
          <label>Enter</label>
          <effects-picker
            :model-value="track.chart?.effects?.enter ?? 'none'"
            @update:model-value="set(() => setEffect(track, 'enter', $event))"
          ></effects-picker>
        </div>
        <div class="field-row">
          <label>Exit</label>
          <effects-picker
            :model-value="track.chart?.effects?.exit ?? 'none'"
            @update:model-value="set(() => setEffect(track, 'exit', $event))"
          ></effects-picker>
        </div>
      </div>

    </div><!-- acc-body -->
  </div><!-- acc-row -->

</div>
  `,
})
