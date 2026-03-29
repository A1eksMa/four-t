import { defineComponent, ref, computed, watch } from 'vue'
import { wizardData, activeNav, pushUndo } from '../store.js'
import { ensureChart, toggleChartField, ensureChartField, setEffect } from './form-helpers.js'
import { ChartTextForm } from './chart-text-form.js'
import { ScaleEditor }   from './scale-editor.js'
import { ColorPicker }   from '../controls/color-picker.js'
import { LevelSlider }   from '../controls/slider.js'
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

// ─── Component ───────────────────────────────────────────────────────────────

export const TracksPanel = defineComponent({
  name: 'TracksPanel',
  components: { ColorPicker, LevelSlider, EffectsPicker, ChartTextForm, ScaleEditor },

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

    function set(fn) { pushUndo(); fn() }
    function snap()  { pushUndo() }

    return {
      openId, tracks, scale,
      toggle, addTrack, deleteTrack, moveUp, moveDown,
      set, snap,
      toggleChartField, ensureChartField, setEffect,
    }
  },

  template: `
<div class="tracks-panel">

  <!-- Scale editor -->
  <scale-editor></scale-editor>

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
        <chart-text-form :entity="track"></chart-text-form>
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
