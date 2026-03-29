import { defineComponent, ref, computed, watch } from 'vue'
import { wizardData, activeNav, pushUndo } from '../store.js'
import { ensureChart, toggleChartField, ensureChartField, setEffect } from './form-helpers.js'
import { ChartTextForm } from './chart-text-form.js'
import { LevelSlider }   from '../controls/slider.js'
import { EffectsPicker } from '../controls/effects-picker.js'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TIMELINE_CONFIG_DEFAULTS = {
  scale:         'quarter',
  interpolation: 'smooth',
  edge_before:   'zero',
  edge_after:    'extend',
  aggregation:   'last',
  bar_click:     'tools',
}

const newThread = () => ({
  id:              `thread-${Date.now()}`,
  name:            { en: 'New Thread', ru: 'Новый тред' },
  level:           5,
  status:          'active',
  on_click:        'timeline',
  chart:           null,
  timeline_config: { ...TIMELINE_CONFIG_DEFAULTS },
  timeline:        [],
  tools:           [],
})

// ─── Component ───────────────────────────────────────────────────────────────

export const ThreadsPanel = defineComponent({
  name: 'ThreadsPanel',
  components: { LevelSlider, EffectsPicker, ChartTextForm },

  setup() {
    const openId = ref(null)

    const activeTrack = computed(() => {
      const id = activeNav.value.trackId
      return id ? wizardData.value.tracks.find(t => t.id === id) ?? null : null
    })

    const threads = computed(() => activeTrack.value?.threads ?? [])
    const scale   = computed(() => wizardData.value.scale)

    // Sync accordion with preview navigation (thread click → open that row)
    watch(() => activeNav.value.threadId, id => {
      if (id) openId.value = id
    })

    // Reset open row when active track changes
    watch(() => activeNav.value.trackId, () => {
      openId.value = null
    })

    function toggle(id) {
      openId.value = openId.value === id ? null : id
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    function addThread() {
      if (!activeTrack.value) return
      pushUndo()
      const t = newThread()
      activeTrack.value.threads.push(t)
      openId.value = t.id
    }

    function deleteThread(id) {
      if (!activeTrack.value) return
      if (!confirm('Delete this thread, its timeline and tools?')) return
      pushUndo()
      const idx = activeTrack.value.threads.findIndex(t => t.id === id)
      if (idx !== -1) activeTrack.value.threads.splice(idx, 1)
      if (openId.value === id) openId.value = null
    }

    function moveUp(idx) {
      if (!activeTrack.value || idx === 0) return
      pushUndo()
      const arr = activeTrack.value.threads
      const tmp = arr[idx - 1]; arr[idx - 1] = arr[idx]; arr[idx] = tmp
    }

    function moveDown(idx) {
      if (!activeTrack.value) return
      const arr = activeTrack.value.threads
      if (idx >= arr.length - 1) return
      pushUndo()
      const tmp = arr[idx + 1]; arr[idx + 1] = arr[idx]; arr[idx] = tmp
    }

    // ── Field mutations ───────────────────────────────────────────────────────

    function set(fn) { pushUndo(); fn() }
    function snap()  { pushUndo() }

    function ensureTlConfig(thread) {
      if (!thread.timeline_config) {
        thread.timeline_config = { ...TIMELINE_CONFIG_DEFAULTS }
      }
    }

    function setTlConfig(thread, key, value) {
      pushUndo()
      ensureTlConfig(thread)
      thread.timeline_config[key] = value
    }

    return {
      openId, activeTrack, threads, scale,
      toggle, addThread, deleteThread, moveUp, moveDown,
      set, snap,
      toggleChartField, ensureChartField, setEffect,
      setTlConfig,
    }
  },

  template: `
<div class="threads-panel">

  <!-- No track selected -->
  <div class="panel-empty" v-if="!activeTrack">
    Click a track in the preview to edit its threads.
  </div>

  <template v-else>
    <!-- Toolbar -->
    <div class="panel-toolbar">
      <button class="btn-tool" @click="addThread">+ Add Thread</button>
    </div>

    <!-- Empty state -->
    <div class="panel-empty" v-if="threads.length === 0">
      No threads in this track yet.
    </div>

    <!-- Accordion -->
    <div class="acc-row" v-for="(thread, idx) in threads" :key="thread.id">

      <!-- Row header -->
      <div class="acc-header" @click="toggle(thread.id)" :class="{ open: openId === thread.id }">
        <span class="acc-arrow">{{ openId === thread.id ? '▼' : '▶' }}</span>
        <span class="acc-label">{{ thread.name?.en || thread.id }}</span>
        <span class="acc-badge" v-if="thread.status === 'archive'">archive</span>
        <button class="icon-btn" @click.stop="moveUp(idx)"   :disabled="idx === 0"                title="Move up">↑</button>
        <button class="icon-btn" @click.stop="moveDown(idx)" :disabled="idx === threads.length - 1" title="Move down">↓</button>
        <button class="icon-btn danger" @click.stop="deleteThread(thread.id)" title="Delete">✕</button>
      </div>

      <!-- Edit form -->
      <div class="acc-body" v-if="openId === thread.id">

        <!-- Identity -->
        <div class="form-section">
          <div class="form-section-title">Identity</div>
          <div class="field-row">
            <label>Name EN</label>
            <input type="text" :value="thread.name?.en"
              @change="set(() => thread.name.en = $event.target.value)">
          </div>
          <div class="field-row">
            <label>Name RU</label>
            <input type="text" :value="thread.name?.ru"
              @change="set(() => thread.name.ru = $event.target.value)">
          </div>
          <div class="field-row">
            <label>Status</label>
            <label class="field-toggle">
              <input type="checkbox"
                :checked="thread.status === 'active'"
                @change="set(() => thread.status = $event.target.checked ? 'active' : 'archive')"
              >
              <span>{{ thread.status === 'active' ? 'Active' : 'Archive (hidden from chart)' }}</span>
            </label>
          </div>
        </div>

        <!-- Behavior -->
        <div class="form-section">
          <div class="form-section-title">Behavior</div>
          <div class="field-row">
            <label>Level</label>
            <level-slider
              :model-value="thread.level"
              :scale="scale"
              @before-change="snap()"
              @update:model-value="thread.level = $event"
            ></level-slider>
          </div>
          <div class="field-row">
            <label>On click</label>
            <select :value="thread.on_click ?? 'null'"
              @change="set(() => thread.on_click = $event.target.value === 'null' ? null : $event.target.value)">
              <option value="timeline">Timeline</option>
              <option value="tools">Tools</option>
              <option value="null">(none — not clickable)</option>
            </select>
          </div>
        </div>

        <!-- Timeline config -->
        <div class="form-section">
          <div class="form-section-title">Timeline config</div>
          <div class="field-row">
            <label>Scale</label>
            <select :value="thread.timeline_config?.scale ?? 'quarter'"
              @change="setTlConfig(thread, 'scale', $event.target.value)">
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="quarter">Quarter (default)</option>
              <option value="year">Year</option>
            </select>
          </div>
          <div class="field-row">
            <label>Interpolation</label>
            <select :value="thread.timeline_config?.interpolation ?? 'smooth'"
              @change="setTlConfig(thread, 'interpolation', $event.target.value)">
              <option value="step">Step</option>
              <option value="linear">Linear</option>
              <option value="smooth">Smooth (default)</option>
            </select>
          </div>
          <div class="field-row">
            <label>Edge before</label>
            <select :value="thread.timeline_config?.edge_before ?? 'zero'"
              @change="setTlConfig(thread, 'edge_before', $event.target.value)">
              <option value="zero">Zero (default)</option>
              <option value="extend">Extend</option>
              <option value="null">Null</option>
            </select>
          </div>
          <div class="field-row">
            <label>Edge after</label>
            <select :value="thread.timeline_config?.edge_after ?? 'extend'"
              @change="setTlConfig(thread, 'edge_after', $event.target.value)">
              <option value="zero">Zero</option>
              <option value="extend">Extend (default)</option>
              <option value="null">Null</option>
            </select>
          </div>
          <div class="field-row">
            <label>Aggregation</label>
            <select :value="thread.timeline_config?.aggregation ?? 'last'"
              @change="setTlConfig(thread, 'aggregation', $event.target.value)">
              <option value="last">Last (default)</option>
              <option value="max">Max</option>
              <option value="avg">Avg</option>
            </select>
          </div>
          <div class="field-row">
            <label>Bar click</label>
            <label class="field-toggle">
              <input type="checkbox"
                :checked="thread.timeline_config?.bar_click === 'tools'"
                @change="setTlConfig(thread, 'bar_click', $event.target.checked ? 'tools' : null)"
              >
              <span>{{ thread.timeline_config?.bar_click === 'tools' ? 'Drill into tools (default)' : 'Disabled (terminal level)' }}</span>
            </label>
          </div>
        </div>

        <!-- Chart text -->
        <div class="form-section">
          <div class="form-section-title">Chart text</div>
          <chart-text-form :entity="thread"></chart-text-form>
        </div>

        <!-- Effects -->
        <div class="form-section">
          <div class="form-section-title">Transition effects</div>
          <div class="field-row">
            <label>Enter</label>
            <effects-picker
              :model-value="thread.chart?.effects?.enter ?? 'none'"
              @update:model-value="set(() => setEffect(thread, 'enter', $event))"
            ></effects-picker>
          </div>
          <div class="field-row">
            <label>Exit</label>
            <effects-picker
              :model-value="thread.chart?.effects?.exit ?? 'none'"
              @update:model-value="set(() => setEffect(thread, 'exit', $event))"
            ></effects-picker>
          </div>
        </div>

      </div><!-- acc-body -->
    </div><!-- acc-row -->
  </template>

</div>
  `,
})
