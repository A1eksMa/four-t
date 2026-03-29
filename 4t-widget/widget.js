import { loadData }                    from './core/loader.js'
import { initState, pushLevel, popTo,
         setLang, currentFrame,
         stackDepth }                  from './core/state.js'
import { resolveNext, canDrillDown,
         getTrack, getThread,
         buildNextFrame }              from './core/nav.js'
import { applyEffect,
         registerEffect as regEffect } from './effects/registry.js'
import { buildL1Option }               from './charts/L1_tracks.js'
import { buildL2Option }               from './charts/L2_threads.js'
import { buildL3Option }               from './charts/L3_timeline.js'
import { buildL4Option }               from './charts/L4_tools.js'
import { getString }                   from './core/i18n.js'
import { grow }                        from './effects/grow.js'

// Map<symbol, Instance>
const instances = new Map()

const COLLAPSE_MS = 450

// ─── Theme ───────────────────────────────────────────────────────────────────

const isDarkMode = () =>
  document.documentElement.classList.contains('dark') ||
  (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)

const resolveTheme = state => {
  const pref = state.data.style?.theme ?? 'auto'
  if (pref === 'dark')  return 'dark'
  if (pref === 'light') return null
  return isDarkMode() ? 'dark' : null
}

// ─── Error rendering ─────────────────────────────────────────────────────────

const renderError = (element, err) => {
  element.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#e55;font-family:sans-serif;font-size:14px;padding:20px;text-align:center">Failed to load data: ${err}</div>`
}

// ─── UI helpers ──────────────────────────────────────────────────────────────

const loadLocale = async lang => {
  try {
    const url = new URL(`./i18n/${lang}.json`, import.meta.url)
    const res = await fetch(url)
    return res.ok ? await res.json() : {}
  } catch { return {} }
}

const updateBreadcrumb = (state, element, locale) => {
  const crumbEl = element.querySelector('.ft-breadcrumb')
  if (!crumbEl) return
  const stack  = state.stack
  const labels = [getString(locale, 'breadcrumb_all_tracks')]
  if (stack.length > 1) {
    const track = getTrack(state.data, stack[1]?.trackId)
    if (track) labels.push(getString(locale, track.name?.[state.lang] ?? track.name ?? ''))
  }
  if (stack.length > 2) {
    const thread = getThread(state.data, stack[1]?.trackId, stack[2]?.threadId)
    if (thread) labels.push(thread.name?.[state.lang] ?? thread.name ?? '')
  }
  crumbEl.innerHTML = labels
    .map((label, i) =>
      i < labels.length - 1
        ? `<button class="ft-crumb" data-depth="${i}" style="cursor:pointer;background:none;border:none;padding:0 4px;font-size:13px;color:inherit;text-decoration:underline">${label}</button>`
        + `<span style="padding:0 4px;opacity:0.5">›</span>`
        : `<span style="padding:0 4px;font-size:13px;opacity:0.7">${label}</span>`
    )
    .join('')
  crumbEl.querySelectorAll('.ft-crumb').forEach(btn => {
    btn.addEventListener('click', () => {
      const depth = parseInt(btn.dataset.depth)
      const id = element._ftId
      if (id) navigateBack(id, depth)
    })
  })
}

const updateHint = (state, element, locale) => {
  const hintEl = element.querySelector('.ft-hint')
  if (!hintEl) return
  const frame = currentFrame(state)
  const key = { track: 'hint_l1', thread: 'hint_l2', timeline: 'hint_l3', tools: 'hint_l4' }[frame.type]
  hintEl.textContent = getString(locale, key)
}

// ─── Render ───────────────────────────────────────────────────────────────────

const buildOption = (frame, state, locale) => {
  switch (frame.type) {
    case 'track':
      return buildL1Option(state.data.tracks, state.lang)
    case 'thread': {
      const track = getTrack(state.data, frame.trackId)
      return buildL2Option(track, state.lang)
    }
    case 'timeline': {
      const thread = getThread(state.data, frame.trackId, frame.threadId)
      return buildL3Option(thread, true, state.lang)
    }
    case 'tools': {
      const thread = getThread(state.data, frame.trackId, frame.threadId)
      return buildL4Option(thread, frame.periodMs, state.lang, locale)
    }
  }
}

const render = (id, locale = {}) => {
  const inst  = instances.get(id)
  const state = inst.stateRef.state
  const frame = currentFrame(state)
  const option = buildOption(frame, state, locale)
  inst.chart.setOption(option, true)
  updateBreadcrumb(state, inst.element, locale)
  updateHint(state, inst.element, locale)
}

// ─── Click handling ───────────────────────────────────────────────────────────

const resolveEntity = (frame, params, data) => {
  switch (frame.type) {
    case 'track':    return getTrack(data, data.tracks[params.dataIndex]?.id)
    case 'thread':   {
      const track = getTrack(data, frame.trackId)
      if (!track) return null
      const sorted = [...track.threads].sort((a, b) => b.level - a.level)
      return sorted[params.dataIndex] ?? null
    }
    case 'timeline': {
      const thread = getThread(data, frame.trackId, frame.threadId)
      return thread ?? null
    }
    default: return null
  }
}

const onChartClick = (params, id, locale) => {
  const inst = instances.get(id)
  if (!inst || inst.flipping) return

  const state    = inst.stateRef.state
  const frame    = currentFrame(state)
  if (frame.type === 'tools') return

  const entity   = resolveEntity(frame, params, state.data)
  if (!entity) return

  const nextType = resolveNext(entity, frame.type)
  if (!nextType) return

  const nextFrame  = buildNextFrame(nextType, entity, params, state)

  if (frame.type === 'track') {
    inst.flipping = true
    inst.chart.setOption(buildL1Option(state.data.tracks, state.lang, true), false)
    setTimeout(() => {
      inst.stateRef.state = pushLevel(inst.stateRef.state, nextFrame)
      render(id, locale)
      inst.flipping = false
    }, COLLAPSE_MS)
    return
  }

  if (frame.type === 'thread') {
    inst.flipping = true
    const track = getTrack(state.data, frame.trackId)
    inst.chart.setOption(buildL2Option(track, state.lang, true), false)
    setTimeout(() => {
      inst.stateRef.state = pushLevel(inst.stateRef.state, nextFrame)
      render(id, locale)
      inst.flipping = false
      if (nextFrame.type === 'timeline') {
        const thread = getThread(inst.stateRef.state.data, nextFrame.trackId, nextFrame.threadId)
        grow(inst.chart, thread, inst.stateRef.state.lang)
      }
    }, COLLAPSE_MS)
    return
  }

  const exitEffect = entity.chart?.effects?.exit ?? 'none'

  inst.flipping = true
  applyEffect(exitEffect, inst.element,
    () => {
      inst.stateRef.state = pushLevel(inst.stateRef.state, nextFrame)
      render(id, locale)
    },
    () => {
      inst.flipping = false
      if (nextFrame.type === 'timeline') {
        const thread = getThread(inst.stateRef.state.data, nextFrame.trackId, nextFrame.threadId)
        grow(inst.chart, thread, inst.stateRef.state.lang)
      }
    }
  )
}

const navigateBack = (id, targetDepth) => {
  const inst = instances.get(id)
  if (!inst || inst.flipping) return
  inst.flipping = true

  if (targetDepth === 0 || targetDepth === 1) {
    inst.stateRef.state = popTo(inst.stateRef.state, targetDepth)
    render(id, inst._locale)
    inst.flipping = false
    return
  }

  applyEffect('flipX', inst.element,
    () => {
      inst.stateRef.state = popTo(inst.stateRef.state, targetDepth)
      render(id, inst._locale)
    },
    () => { inst.flipping = false }
  )
}

// ─── Handlers attachment ──────────────────────────────────────────────────────

const attachHandlers = (id, locale) => {
  const inst = instances.get(id)
  inst.chart.on('click', params => onChartClick(params, id, locale))
}

// ─── Dark mode observer ───────────────────────────────────────────────────────

const setupDarkModeObserver = id => {
  const inst = instances.get(id)
  const observer = new MutationObserver(() => {
    const theme = resolveTheme(inst.stateRef.state)
    inst.chart.dispose()
    inst.chart = echarts.init(inst.element.querySelector('.ft-chart'), theme, { renderer: 'canvas' })
    attachHandlers(id, inst._locale)
    render(id, inst._locale)
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  inst._observer = observer
}

const setupResizeObserver = id => {
  const inst = instances.get(id)
  const ro = new ResizeObserver(() => inst.chart.resize())
  ro.observe(inst.element)
  inst._resizeObserver = ro
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const FourT = {
  init: async (element, config) => {
    // Wrap element with breadcrumb + hint + chart container
    element.innerHTML = `
      <div class="ft-breadcrumb" style="padding:6px 12px;min-height:28px"></div>
      <div class="ft-chart" style="width:100%;height:calc(100% - 56px)"></div>
      <div class="ft-hint" style="padding:4px 12px;font-size:12px;opacity:0.6;min-height:20px"></div>
    `
    const chartEl = element.querySelector('.ft-chart')

    const result = await loadData(config.dataUrl)
    if (result.tag === 'Err') {
      renderError(element, result.error)
      return null
    }

    const data     = result.value
    const state    = initState(config, data)
    const stateRef = { state }
    const theme    = resolveTheme(state)
    const chart    = echarts.init(chartEl, theme, { renderer: 'canvas' })
    const id       = Symbol()
    const locale   = await loadLocale(config.lang ?? 'en')

    instances.set(id, { stateRef, chart, element, flipping: false, _locale: locale })
    element._ftId = id

    attachHandlers(id, locale)
    setupDarkModeObserver(id)
    setupResizeObserver(id)
    render(id, locale)

    return id
  },

  update: (id, newData) => {
    const inst = instances.get(id)
    if (!inst) return
    inst.stateRef.state = { ...inst.stateRef.state, data: newData }
    render(id, inst._locale)
  },

  destroy: (id) => {
    const inst = instances.get(id)
    if (!inst) return
    inst.chart.dispose()
    inst._observer?.disconnect()
    inst._resizeObserver?.disconnect()
    instances.delete(id)
  },

  setLang: async (id, lang) => {
    const inst = instances.get(id)
    if (!inst) return
    inst.stateRef.state = setLang(inst.stateRef.state, lang)
    inst._locale = await loadLocale(lang)
    render(id, inst._locale)
  },

  registerEffect: (name, fn) => regEffect(name, fn),
}
