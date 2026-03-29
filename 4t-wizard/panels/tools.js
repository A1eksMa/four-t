import { defineComponent, ref, computed, watch } from 'vue'
import { wizardData, activeNav, pushUndo } from '../store.js'
import { periodToMs } from '../../4t-widget/core/scale.js'
import { LevelSlider } from '../controls/slider.js'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const newSnapshot = () => ({ period: '', snapshot: [] })
const newTool     = () => ({ name: '', level: 5 })

// Returns the index of the snapshot closest to periodMs (at or before it).
// Returns null if no match.
function closestSnapIdx(thread, periodMs) {
  if (!periodMs || !thread?.tools?.length) return null
  const scale  = thread.timeline_config?.scale ?? 'quarter'
  let bestIdx  = null
  let bestMs   = -Infinity
  thread.tools.forEach((snap, i) => {
    try {
      const ms = periodToMs(scale, snap.period)
      if (ms <= periodMs && ms > bestMs) { bestMs = ms; bestIdx = i }
    } catch { /* skip invalid period */ }
  })
  return bestIdx
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ToolsPanel = defineComponent({
  name: 'ToolsPanel',
  components: { LevelSlider },

  setup() {
    const openSnapIdx = ref(null)

    const activeTrack = computed(() => {
      const id = activeNav.value.trackId
      return id ? wizardData.value.tracks.find(t => t.id === id) ?? null : null
    })

    const activeThread = computed(() => {
      const tid = activeNav.value.threadId
      if (!activeTrack.value || !tid) return null
      return activeTrack.value.threads.find(t => t.id === tid) ?? null
    })

    const scale    = computed(() => wizardData.value.scale)
    const snapshots = computed(() => activeThread.value?.tools ?? [])

    // Highlight closest snapshot when preview navigates to a period
    watch(() => activeNav.value.periodMs, pMs => {
      if (!activeThread.value || pMs == null) return
      const idx = closestSnapIdx(activeThread.value, pMs)
      if (idx !== null) openSnapIdx.value = idx
    })

    // Reset on thread change
    watch(() => activeNav.value.threadId, () => { openSnapIdx.value = null })

    function toggleSnap(idx) {
      openSnapIdx.value = openSnapIdx.value === idx ? null : idx
    }

    const highlightIdx = computed(() =>
      activeNav.value.periodMs != null && activeThread.value
        ? closestSnapIdx(activeThread.value, activeNav.value.periodMs)
        : null
    )

    // ── Snapshot CRUD ─────────────────────────────────────────────────────────

    function addSnapshot() {
      if (!activeThread.value) return
      pushUndo()
      if (!activeThread.value.tools) activeThread.value.tools = []
      const s = newSnapshot()
      activeThread.value.tools.push(s)
      openSnapIdx.value = activeThread.value.tools.length - 1
    }

    function deleteSnapshot(idx) {
      if (!activeThread.value) return
      if (!confirm('Delete this snapshot and all its tools?')) return
      pushUndo()
      activeThread.value.tools.splice(idx, 1)
      if (openSnapIdx.value === idx) openSnapIdx.value = null
    }

    function setSnapPeriod(idx, value) {
      pushUndo()
      activeThread.value.tools[idx].period = value
    }

    // ── Tool CRUD ─────────────────────────────────────────────────────────────

    function addTool(snapIdx) {
      pushUndo()
      const snap = activeThread.value.tools[snapIdx]
      if (!snap.snapshot) snap.snapshot = []
      snap.snapshot.push(newTool())
    }

    function deleteTool(snapIdx, toolIdx) {
      pushUndo()
      activeThread.value.tools[snapIdx].snapshot.splice(toolIdx, 1)
    }

    function setToolName(snapIdx, toolIdx, value) {
      pushUndo()
      activeThread.value.tools[snapIdx].snapshot[toolIdx].name = value
    }

    function beforeChange() { pushUndo() }

    function setToolLevel(snapIdx, toolIdx, value) {
      activeThread.value.tools[snapIdx].snapshot[toolIdx].level = value
    }

    return {
      openSnapIdx, activeTrack, activeThread, scale, snapshots, highlightIdx,
      toggleSnap,
      addSnapshot, deleteSnapshot, setSnapPeriod,
      addTool, deleteTool, setToolName, beforeChange, setToolLevel,
    }
  },

  template: `
<div class="tools-panel">

  <!-- No thread selected -->
  <div class="panel-empty" v-if="!activeThread">
    Click a timeline bar in the preview to view tools for that period.
  </div>

  <template v-else>
    <!-- Toolbar -->
    <div class="panel-toolbar">
      <button class="btn-tool" @click="addSnapshot">+ Add Snapshot</button>
      <span class="hint-text" v-if="highlightIdx !== null">
        Preview period → snapshot #{{ highlightIdx + 1 }}
      </span>
    </div>

    <!-- Empty state -->
    <div class="panel-empty" v-if="snapshots.length === 0">
      No tool snapshots yet.
    </div>

    <!-- Snapshots accordion -->
    <div class="acc-row"
      v-for="(snap, sIdx) in snapshots"
      :key="sIdx"
      :class="{ highlighted: highlightIdx === sIdx }"
    >
      <!-- Snapshot header -->
      <div class="acc-header" @click="toggleSnap(sIdx)" :class="{ open: openSnapIdx === sIdx }">
        <span class="acc-arrow">{{ openSnapIdx === sIdx ? '▼' : '▶' }}</span>
        <span class="acc-label">
          <input class="snap-period-input" type="text"
            :value="snap.period"
            :placeholder="'period'"
            @click.stop
            @change="setSnapPeriod(sIdx, $event.target.value)"
          >
        </span>
        <span class="acc-badge">{{ snap.snapshot?.length ?? 0 }} tools</span>
        <span class="acc-badge highlight-badge" v-if="highlightIdx === sIdx">◀ preview</span>
        <button class="icon-btn danger" @click.stop="deleteSnapshot(sIdx)" title="Delete snapshot">✕</button>
      </div>

      <!-- Tools list -->
      <div class="acc-body" v-if="openSnapIdx === sIdx">
        <div class="panel-toolbar" style="margin-bottom:10px">
          <button class="btn-tool" @click="addTool(sIdx)">+ Add Tool</button>
        </div>

        <div class="panel-empty" v-if="!snap.snapshot?.length">
          No tools in this snapshot.
        </div>

        <table class="tl-table" v-else>
          <thead>
            <tr>
              <th>Tool name</th>
              <th>Level</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tool, tIdx) in snap.snapshot" :key="tIdx">
              <td>
                <input class="tl-input" type="text"
                  :value="tool.name"
                  placeholder="Tool name"
                  @change="setToolName(sIdx, tIdx, $event.target.value)"
                >
              </td>
              <td>
                <level-slider
                  :model-value="tool.level"
                  :scale="scale"
                  @before-change="beforeChange()"
                  @update:model-value="setToolLevel(sIdx, tIdx, $event)"
                ></level-slider>
              </td>
              <td>
                <button class="icon-btn danger" @click="deleteTool(sIdx, tIdx)" title="Delete tool">✕</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div><!-- acc-row -->
  </template>

</div>
  `,
})
