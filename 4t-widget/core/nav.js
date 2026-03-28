import { periodToMs } from './scale.js'

const DEFAULT_CHAIN = {
  track: 'thread', thread: 'timeline', timeline: 'tools', tools: null,
}

export const resolveNext = (entity, entityType) =>
  entity.on_click !== undefined ? entity.on_click : DEFAULT_CHAIN[entityType]

export const canDrillDown = (entity, entityType) =>
  resolveNext(entity, entityType) !== null

export const getTrack  = (data, trackId) =>
  data.tracks.find(t => t.id === trackId)

export const getThread = (data, trackId, threadId) =>
  getTrack(data, trackId)?.threads.find(t => t.id === threadId)

export const buildNextFrame = (nextType, entity, params, state) => {
  const frame = state.stack.at(-1)

  switch (nextType) {
    case 'thread':
      return { type: 'thread', trackId: entity.id }

    case 'timeline':
      return { type: 'timeline', trackId: frame.trackId, threadId: entity.id }

    case 'tools': {
      const thread  = getThread(state.data, frame.trackId, frame.threadId)
      const scale   = thread.timeline_config.scale
      const period  = thread.timeline[params.dataIndex].period
      return { type: 'tools', trackId: frame.trackId, threadId: frame.threadId,
               periodMs: periodToMs(scale, period) }
    }

    default:
      return { type: nextType }
  }
}
