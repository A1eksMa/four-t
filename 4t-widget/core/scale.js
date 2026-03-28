import { Some, getOrElse } from './option.js'

// Parse a period string to milliseconds given a known scale type.
// Falls back to 'quarter' parsing for unknown scale values.
export const periodToMs = (scale, period) => {
  const parsers = {
    quarter: p => new Date(+p.slice(0, 4), (parseInt(p.slice(5)) - 1) * 3, 1).getTime(),
    year:    p => new Date(+p, 0, 1).getTime(),
    month:   p => new Date(p + '-01').getTime(),
    week:    p => isoWeekToMs(p),
    day:     p => new Date(p).getTime(),
  }
  return getOrElse(Some(parsers[scale]), parsers['quarter'])(period)
}

// ISO 8601 week string "2023-W01" → timestamp of Monday of that week
const isoWeekToMs = p => {
  const [year, week] = p.split('-W').map(Number)
  const jan4      = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7
  const monday    = new Date(jan4)
  monday.setDate(jan4.getDate() - (dayOfWeek - 1) + (week - 1) * 7)
  return monday.getTime()
}

// Returns the effective scale for a track.
export const resolveScale = (manifestScale, track) =>
  track.scale ?? manifestScale

// Returns the tool snapshot most recently at or before periodMs.
export const getToolsAtPeriod = (thread, periodMs) => {
  const scale  = thread.timeline_config?.scale ?? 'quarter'
  const snaps  = thread.tools ?? []
  if (!snaps.length) return []
  const sorted = [...snaps].sort(
    (a, b) => periodToMs(scale, a.period) - periodToMs(scale, b.period)
  )
  const best = sorted.reduce(
    (acc, snap) => periodToMs(scale, snap.period) <= periodMs ? snap : acc,
    null
  )
  return best?.snapshot ?? []
}
