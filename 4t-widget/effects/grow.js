import { buildL3Option } from '../charts/L3_timeline.js'

// Animates L3 bars from zero to real values after the flipY transition completes.
// Called directly from widget.js afterFlip callback (not via applyEffect).
// (chart, thread, lang) => void
export const grow = (chart, thread, lang) => {
  chart.setOption(buildL3Option(thread, false, lang), true)
}
