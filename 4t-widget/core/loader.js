import { Ok, Err } from './result.js'

const TIMELINE_CONFIG_DEFAULTS = {
  scale:         'quarter',
  interpolation: 'smooth',
  edge_before:   'zero',
  edge_after:    'extend',
  aggregation:   'last',
  bar_click:     'tools',
}

const fetchJson = async url => {
  try {
    const res = await fetch(url)
    if (!res.ok) return Err(`HTTP ${res.status}: ${url}`)
    return Ok(await res.json())
  } catch (e) {
    return Err(e.message)
  }
}

const fillThreadDefaults = thread => ({
  ...thread,
  timeline_config: { ...TIMELINE_CONFIG_DEFAULTS, ...thread.timeline_config },
  tools: thread.tools ?? [],
})

const mergeTrack = (manifestEntry, trackJson) => ({
  id:       trackJson.track.id,
  name:     trackJson.track.name,
  color:    trackJson.track.color,
  level:    trackJson.track.level,
  status:   trackJson.track.status   ?? 'active',
  on_click: trackJson.track.on_click ?? null,
  scale:    trackJson.track.scale    ?? null,
  chart:    trackJson.track.chart    ?? null,
  threads:  (trackJson.threads ?? []).map(fillThreadDefaults),
})

const merge = (manifest, trackJsons) => {
  if (manifest['4t'] !== '1.0') {
    console.warn(`[four-t] unknown schema version: ${manifest['4t']}`)
  }
  return {
    meta:   manifest.meta,
    scale:  manifest.scale,
    style:  manifest.style  ?? { theme: 'auto' },
    widget: manifest.widget ?? { entry: 'track', entry_track: null, entry_thread: null },
    tracks: manifest.tracks.map((entry, i) => mergeTrack(entry, trackJsons[i])),
  }
}

// loadData(manifestUrl: string) => Promise<Result<LoadedData>>
export const loadData = async manifestUrl => {
  const baseUrl  = manifestUrl.slice(0, manifestUrl.lastIndexOf('/') + 1)
  const manifest = await fetchJson(manifestUrl)
  if (manifest.tag === 'Err') return manifest

  const trackResults = await Promise.all(
    manifest.value.tracks.map(t => fetchJson(baseUrl + t.file))
  )
  const errored = trackResults.find(r => r.tag === 'Err')
  if (errored) return errored

  return Ok(merge(manifest.value, trackResults.map(r => r.value)))
}
