// Shared helpers for track and thread edit forms.

import { pushUndo } from '../store.js'

export function ensureChart(entity) {
  if (!entity.chart) {
    entity.chart = {
      title:     null,
      pre_text:  null,
      post_text: null,
      effects:   { enter: 'none', exit: 'none' },
    }
  }
  if (!entity.chart.effects) {
    entity.chart.effects = { enter: 'none', exit: 'none' }
  }
}

export function toggleChartField(entity, field) {
  pushUndo()
  ensureChart(entity)
  entity.chart[field] = entity.chart[field] ? null : { en: '', ru: '' }
}

export function ensureChartField(entity, field) {
  ensureChart(entity)
  if (!entity.chart[field]) entity.chart[field] = { en: '', ru: '' }
}

export function setEffect(entity, dir, val) {
  ensureChart(entity)
  entity.chart.effects[dir] = val
}
