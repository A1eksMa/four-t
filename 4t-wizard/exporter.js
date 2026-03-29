// ─── Exporter ─────────────────────────────────────────────────────────────────
// Serializes wizardData into the split manifest + track-file format consumed by
// the widget loader, then downloads the result as a ZIP archive via JSZip.

// Build the manifest.json object (top-level keys + tracks index).
function buildManifest(data) {
  return {
    '4t':    '1.0',
    meta:    data.meta,
    scale:   data.scale,
    style:   data.style,
    widget:  data.widget,
    tracks:  data.tracks.map((t, i) => ({
      id:    t.id,
      file:  `${t.id}.json`,
      order: i + 1,
    })),
  }
}

// Build a single <id>.json object for one track.
function buildTrackFile(track) {
  const { id, name, color, level, status, on_click, scale, chart, threads } = track
  return {
    '4t':     '1.0',
    track:    { id, name, color, level, status, on_click, scale, chart },
    threads:  threads ?? [],
  }
}

// Trigger a browser download for a Blob.
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// exportZip(data) — serializes and downloads as '4t-data.zip'.
// Requires JSZip to be available on window.
export async function exportZip(data) {
  const zip = new JSZip() // JSZip loaded via CDN script tag in wizard.html

  zip.file('manifest.json', JSON.stringify(buildManifest(data), null, 2))

  for (const track of data.tracks) {
    zip.file(`${track.id}.json`, JSON.stringify(buildTrackFile(track), null, 2))
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  const name = (data.meta?.title?.en || '4t-data').replace(/[^a-z0-9_-]/gi, '_')
  downloadBlob(blob, `${name}.zip`)
}
