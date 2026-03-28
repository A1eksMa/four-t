const buildEntryFrame = (widgetConfig, data) => {
  const { entry, entry_track, entry_thread } = widgetConfig
  switch (entry) {
    case 'thread':   return { type: 'thread',   trackId: entry_track }
    case 'timeline': return { type: 'timeline', trackId: entry_track, threadId: entry_thread }
    case 'tools':    return { type: 'tools',    trackId: entry_track, threadId: entry_thread, periodMs: null }
    default:         return { type: 'track' }
  }
}

export const initState = (config, data) => ({
  stack:  [buildEntryFrame(data.widget, data)],
  lang:   config.lang ?? 'en',
  data,
  config,
})

export const pushLevel    = (state, frame) => ({ ...state, stack: [...state.stack, frame] })
export const popTo        = (state, depth) => ({ ...state, stack: state.stack.slice(0, depth + 1) })
export const setLang      = (state, lang)  => ({ ...state, lang })
export const currentFrame = state => state.stack.at(-1)
export const stackDepth   = state => state.stack.length - 1
