import { ref } from 'vue'

const SETTINGS_KEY     = 'wizard_settings'
const SESSION_KEY      = 'wizard_session'
const DEFAULT_SETTINGS = { undoDepth: 10 }

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const emptyData = () => ({
  meta:   { title: { en: '', ru: '' }, author: '' },
  scale:  { id: 'default', min: 1, max: 10, divisions: [] },
  style:  { theme: 'auto' },
  widget: { entry: 'track', entry_track: null, entry_thread: null },
  tracks: [],
})

const snapshot = data => JSON.parse(JSON.stringify(data))

function readSettings() {
  try   { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') } }
  catch { return { ...DEFAULT_SETTINGS } }
}

// ─── State ────────────────────────────────────────────────────────────────────

export const settings   = ref(readSettings())
export const wizardData = ref(emptyData())
export const undoStack  = ref([])
export const redoStack  = ref([])

// activeNav mirrors the widget's current navigation level,
// used to determine which editor panel is shown.
export const activeNav = ref({ panel: 'tracks', trackId: null, threadId: null, periodMs: null })

// ─── Settings ─────────────────────────────────────────────────────────────────

export function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings.value))
}

// ─── Session ──────────────────────────────────────────────────────────────────

export function hasSession() {
  return !!localStorage.getItem(SESSION_KEY)
}

export function saveSession() {
  localStorage.setItem(SESSION_KEY, JSON.stringify(wizardData.value))
}

export function loadSession() {
  try {
    const d = JSON.parse(localStorage.getItem(SESSION_KEY))
    if (!d) return false
    wizardData.value = d
    return true
  } catch { return false }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

// ─── Undo / Redo ──────────────────────────────────────────────────────────────

export function pushUndo() {
  const depth = settings.value.undoDepth
  undoStack.value = [...undoStack.value, snapshot(wizardData.value)].slice(-depth)
  redoStack.value = []
}

export function undo() {
  if (!undoStack.value.length) return
  redoStack.value = [...redoStack.value, snapshot(wizardData.value)]
  wizardData.value = undoStack.value[undoStack.value.length - 1]
  undoStack.value  = undoStack.value.slice(0, -1)
}

export function redo() {
  if (!redoStack.value.length) return
  undoStack.value = [...undoStack.value, snapshot(wizardData.value)].slice(-settings.value.undoDepth)
  wizardData.value = redoStack.value[redoStack.value.length - 1]
  redoStack.value  = redoStack.value.slice(0, -1)
}

// ─── Data lifecycle ───────────────────────────────────────────────────────────

export function loadFromData(data) {
  wizardData.value = data
  undoStack.value  = []
  redoStack.value  = []
  activeNav.value  = { panel: 'tracks', trackId: null, threadId: null, periodMs: null }
}

export function resetToEmpty() {
  loadFromData(emptyData())
  clearSession()
}
