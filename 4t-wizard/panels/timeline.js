import { defineComponent, computed } from 'vue'
import { wizardData, activeNav, pushUndo } from '../store.js'
import { periodToMs } from '../../4t-widget/core/scale.js'
import { LevelSlider } from '../controls/slider.js'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PERIOD_HINTS = {
  quarter: '2023-Q1',
  year:    '2023',
  month:   '2023-01',
  week:    '2023-W01',
  day:     '2023-01-15',
}

const newPoint = () => ({
  period:     '',
  level:      5,
  annotation: null,
})

function sortTimeline(thread) {
  const scale = thread.timeline_config?.scale ?? 'quarter'
  thread.timeline.sort((a, b) => {
    try { return periodToMs(scale, a.period) - periodToMs(scale, b.period) }
    catch { return 0 }
  })
}

// ─── Component ───────────────────────────────────────────────────────────────

export const TimelinePanel = defineComponent({
  name: 'TimelinePanel',
  components: { LevelSlider },

  setup() {
    const activeTrack = computed(() => {
      const id = activeNav.value.trackId
      return id ? wizardData.value.tracks.find(t => t.id === id) ?? null : null
    })

    const activeThread = computed(() => {
      const tid = activeNav.value.threadId
      if (!activeTrack.value || !tid) return null
      return activeTrack.value.threads.find(t => t.id === tid) ?? null
    })

    const scale       = computed(() => wizardData.value.scale)
    const tlScale     = computed(() => activeThread.value?.timeline_config?.scale ?? 'quarter')
    const periodHint  = computed(() => PERIOD_HINTS[tlScale.value] ?? '2023-Q1')
    const timeline    = computed(() => activeThread.value?.timeline ?? [])

    function addPoint() {
      if (!activeThread.value) return
      pushUndo()
      activeThread.value.timeline.push(newPoint())
    }

    function deletePoint(idx) {
      if (!activeThread.value) return
      pushUndo()
      activeThread.value.timeline.splice(idx, 1)
    }

    function setPeriod(idx, value) {
      if (!activeThread.value) return
      pushUndo()
      activeThread.value.timeline[idx].period = value
      sortTimeline(activeThread.value)   // auto-sort, no extra undo entry
    }

    function setLevel(idx, value) {
      // pushUndo done via @before-change on the slider
      activeThread.value.timeline[idx].level = value
    }

    function snap() { pushUndo() }

    function toggleAnnotation(idx) {
      if (!activeThread.value) return
      pushUndo()
      const pt = activeThread.value.timeline[idx]
      pt.annotation = pt.annotation ? null : { en: '', ru: '' }
    }

    function setAnnotation(idx, lang, value) {
      const pt = activeThread.value.timeline[idx]
      if (!pt.annotation) pt.annotation = { en: '', ru: '' }
      pt.annotation[lang] = value
    }

    return {
      activeTrack, activeThread, scale, tlScale, periodHint, timeline,
      addPoint, deletePoint, setPeriod, setLevel, snap,
      toggleAnnotation, setAnnotation,
    }
  },

  template: `
<div class="timeline-panel">

  <!-- No thread selected -->
  <div class="panel-empty" v-if="!activeThread">
    Click a thread in the preview to edit its timeline.
  </div>

  <template v-else>
    <!-- Toolbar -->
    <div class="panel-toolbar">
      <button class="btn-tool" @click="addPoint">+ Add Point</button>
      <span class="hint-text">Period format: <code>{{ periodHint }}</code> (scale: {{ tlScale }})</span>
    </div>

    <!-- Empty state -->
    <div class="panel-empty" v-if="timeline.length === 0">
      No timeline points yet.
    </div>

    <!-- Table -->
    <table class="tl-table" v-else>
      <thead>
        <tr>
          <th>Period</th>
          <th>Level</th>
          <th>Annotation EN</th>
          <th>Annotation RU</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(point, idx) in timeline" :key="idx">

          <!-- Period -->
          <td>
            <input class="tl-input" type="text"
              :value="point.period"
              :placeholder="periodHint"
              @change="setPeriod(idx, $event.target.value)"
            >
          </td>

          <!-- Level -->
          <td>
            <level-slider
              :model-value="point.level"
              :scale="scale"
              @before-change="snap()"
              @update:model-value="setLevel(idx, $event)"
            ></level-slider>
          </td>

          <!-- Annotation EN -->
          <td>
            <div v-if="point.annotation" class="tl-ann-cell">
              <input class="tl-input" type="text"
                :value="point.annotation.en"
                @change="setAnnotation(idx, 'en', $event.target.value)">
            </div>
            <button v-else class="btn-tool-sm" @click="toggleAnnotation(idx)">+ add</button>
          </td>

          <!-- Annotation RU -->
          <td>
            <div v-if="point.annotation" class="tl-ann-cell">
              <input class="tl-input" type="text"
                :value="point.annotation.ru"
                @change="setAnnotation(idx, 'ru', $event.target.value)">
              <button class="icon-btn" @click="toggleAnnotation(idx)" title="Remove annotation">✕</button>
            </div>
          </td>

          <!-- Delete -->
          <td>
            <button class="icon-btn danger" @click="deletePoint(idx)" title="Delete point">✕</button>
          </td>

        </tr>
      </tbody>
    </table>
  </template>

</div>
  `,
})
