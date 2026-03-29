import { createApp, ref, computed, watch, onMounted } from 'vue'
import { loadData }     from '../4t-widget/core/loader.js'
import { FourT }        from '../4t-widget/widget.js'
import { periodToMs }   from '../4t-widget/core/scale.js'
import { TracksPanel }  from './panels/tracks.js'
import { ThreadsPanel } from './panels/threads.js'
import { TimelinePanel } from './panels/timeline.js'
import { ToolsPanel }    from './panels/tools.js'
import {
  settings, wizardData, undoStack, redoStack, activeNav,
  saveSettings, saveSession, loadSession, clearSession,
  hasSession, loadFromData, resetToEmpty, pushUndo, undo, redo,
} from './store.js'

// ─── Nav sync ─────────────────────────────────────────────────────────────────

// Attaches a secondary ECharts click listener and a breadcrumb click listener
// to keep activeNav in sync with the widget's navigation state.
function setupNavSync(previewEl) {
  const chartEl = previewEl.querySelector('.ft-chart')
  if (!chartEl) return

  // ECharts exposes instances by DOM element via the global echarts object.
  const echartsInst = echarts.getInstanceByDom(chartEl)
  if (!echartsInst) return

  echartsInst.on('click', params => {
    const data  = wizardData.value
    const panel = activeNav.value.panel

    if (panel === 'tracks') {
      const track = data.tracks[params.dataIndex]
      if (track) activeNav.value = { panel: 'threads', trackId: track.id, threadId: null }

    } else if (panel === 'threads') {
      const track = data.tracks.find(t => t.id === activeNav.value.trackId)
      if (track) {
        // Widget sorts threads by level desc — mirror the same sort here
        const sorted = [...(track.threads || [])].sort((a, b) => b.level - a.level)
        const thread = sorted[params.dataIndex]
        if (thread) activeNav.value = { ...activeNav.value, panel: 'timeline', threadId: thread.id }
      }

    } else if (panel === 'timeline') {
      const track  = data.tracks.find(t => t.id === activeNav.value.trackId)
      const thread = track?.threads?.find(t => t.id === activeNav.value.threadId)
      let pMs = null
      if (thread) {
        const point = thread.timeline[params.dataIndex]
        if (point) {
          const sc = thread.timeline_config?.scale ?? 'quarter'
          try { pMs = periodToMs(sc, point.period) } catch { pMs = null }
        }
      }
      activeNav.value = { ...activeNav.value, panel: 'tools', periodMs: pMs }
    }
    // tools level: no further navigation
  })

  // Breadcrumb back-navigation: .ft-crumb buttons have data-depth attribute
  previewEl.addEventListener('click', e => {
    const btn = e.target.closest('.ft-crumb')
    if (!btn) return
    const depth  = parseInt(btn.dataset.depth)
    const panels = ['tracks', 'threads', 'timeline', 'tools']
    activeNav.value = {
      panel:    panels[depth] ?? 'tracks',
      trackId:  depth >= 1 ? activeNav.value.trackId  : null,
      threadId: depth >= 2 ? activeNav.value.threadId : null,
      periodMs: depth >= 3 ? activeNav.value.periodMs : null,
    }
  })
}

// ─── App ──────────────────────────────────────────────────────────────────────

const app = createApp({
  setup() {
    // ── UI state ─────────────────────────────────────────────────────────────
    const showDialog      = ref(false)
    const showSettings    = ref(false)
    const showJsonDrawer  = ref(false)
    const lang            = ref('en')
    const copyFeedback    = ref(false)
    const settingsForm    = ref({ undoDepth: settings.value.undoDepth })
    const loadError       = ref('')

    // ── Preview widget ────────────────────────────────────────────────────────
    let previewId   = null
    let exampleData = null

    // Label for the active panel context header
    const activeTrack = computed(() =>
      wizardData.value.tracks.find(t => t.id === activeNav.value.trackId) ?? null
    )
    const activeThread = computed(() =>
      activeTrack.value?.threads?.find(t => t.id === activeNav.value.threadId) ?? null
    )

    const panelLabel = computed(() => {
      const p = activeNav.value.panel
      if (p === 'tracks')   return 'Tracks'
      if (p === 'threads')  return activeTrack.value
        ? `Threads — ${activeTrack.value.name?.en ?? activeTrack.value.id}`
        : 'Threads — (click a track in preview)'
      if (p === 'timeline') return activeThread.value
        ? `Timeline — ${activeThread.value.name?.en ?? activeThread.value.id}`
        : 'Timeline — (click a thread in preview)'
      if (p === 'tools')    return 'Tools'
      return ''
    })

    // ── Lifecycle ─────────────────────────────────────────────────────────────
    onMounted(async () => {
      const previewEl = document.getElementById('preview')

      // Init widget (uses example data as initial render)
      previewId = await FourT.init(previewEl, {
        dataUrl: './4t-data/example/manifest.json',
        lang:    lang.value,
      })

      if (previewId) setupNavSync(previewEl)

      // Load example data into store so wizard has a starting dataset
      const result = await loadData('./4t-data/example/manifest.json')
      if (result.tag === 'Ok') {
        exampleData = result.value
        if (hasSession()) {
          showDialog.value = true
        } else {
          loadFromData(exampleData)
        }
      }

      // Keep preview in sync with store on every change
      watch(wizardData, newData => {
        if (previewId && newData) FourT.update(previewId, newData)
        saveSession()
      }, { deep: true })
    })

    // ── Start dialog actions ──────────────────────────────────────────────────
    function dialogResume() {
      loadSession()
      showDialog.value = false
    }

    function dialogNew() {
      resetToEmpty()
      showDialog.value = false
    }

    function dialogOpen() {
      showDialog.value = false
      document.getElementById('file-input').click()
    }

    // ── File open ─────────────────────────────────────────────────────────────
    function onFileSelected(e) {
      const file = e.target.files[0]
      if (!file) return
      loadError.value = ''
      const reader = new FileReader()
      reader.onload = ev => {
        try {
          const data = JSON.parse(ev.target.result)
          loadFromData(data)
        } catch {
          loadError.value = 'Invalid JSON file.'
        }
      }
      reader.readAsText(file)
      e.target.value = '' // reset so same file can be re-opened
    }

    // ── New ───────────────────────────────────────────────────────────────────
    function handleNew() {
      if (confirm('Discard current work and start with an empty canvas?')) {
        resetToEmpty()
      }
    }

    // ── Open ──────────────────────────────────────────────────────────────────
    function handleOpen() {
      document.getElementById('file-input').click()
    }

    // ── Lang ──────────────────────────────────────────────────────────────────
    function toggleLang() {
      lang.value = lang.value === 'en' ? 'ru' : 'en'
      if (previewId) FourT.setLang(previewId, lang.value)
    }

    // ── Undo / Redo ───────────────────────────────────────────────────────────
    const canUndo = computed(() => undoStack.value.length > 0)
    const canRedo = computed(() => redoStack.value.length > 0)

    function handleUndo() { undo() }
    function handleRedo() { redo() }

    // ── Settings ──────────────────────────────────────────────────────────────
    function openSettings() {
      settingsForm.value = { undoDepth: settings.value.undoDepth }
      showSettings.value = true
    }

    function saveSettingsForm() {
      const depth = parseInt(settingsForm.value.undoDepth)
      if (depth > 0 && depth <= 200) {
        settings.value.undoDepth = depth
        saveSettings()
      }
      showSettings.value = false
    }

    // ── JSON drawer ───────────────────────────────────────────────────────────
    const jsonPreview = computed(() => {
      const track = activeTrack.value
      if (!track) {
        // Show manifest-level summary when no track is active
        const { meta, scale, style, widget, tracks } = wizardData.value
        return JSON.stringify({ meta, scale, style, widget,
          tracks: tracks.map(t => ({ id: t.id, name: t.name })) }, null, 2)
      }
      return JSON.stringify(track, null, 2)
    })

    async function copyJson() {
      try {
        await navigator.clipboard.writeText(jsonPreview.value)
        copyFeedback.value = true
        setTimeout(() => { copyFeedback.value = false }, 1500)
      } catch { /* clipboard not available */ }
    }

    return {
      // store refs (read-only in template, mutations go through store functions)
      wizardData, activeNav, settings,
      // ui state
      showDialog, showSettings, showJsonDrawer, lang, copyFeedback,
      settingsForm, loadError,
      // computed
      panelLabel, canUndo, canRedo, jsonPreview,
      // handlers
      dialogResume, dialogNew, dialogOpen,
      onFileSelected, handleNew, handleOpen,
      toggleLang, handleUndo, handleRedo,
      openSettings, saveSettingsForm,
      copyJson,
    }
  }
})

app.component('TracksPanel',   TracksPanel)
app.component('ThreadsPanel',  ThreadsPanel)
app.component('TimelinePanel', TimelinePanel)
app.component('ToolsPanel',    ToolsPanel)

app.mount('#app')
