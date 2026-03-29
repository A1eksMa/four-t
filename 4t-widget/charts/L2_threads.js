import { resolveField } from '../core/i18n.js'
import { shade } from '../core/color.js'

// buildL2Option(track: TrackData, lang: string, zeroed?: boolean) => EChartsOption
export const buildL2Option = (track, lang, zeroed = false) => {
  const sorted  = [...track.threads].sort((a, b) => b.level - a.level)
  const total   = sorted.length
  const names   = sorted.map(t => resolveField(t.name, lang))
  const values  = sorted.map((t, i) => ({
    value: zeroed ? 0 : t.level,
    itemStyle: {
      color:   shade(track.color, i, total),
      opacity: t.status === 'archive' ? 0.42 : 1,
    },
  }))

  return {
    animation: true,
    animationDuration: 600,
    animationEasing: 'cubicOut',
    animationDurationUpdate: 400,
    animationEasingUpdate: 'cubicIn',
    tooltip: {
      trigger: 'item',
      formatter: p => `${names[p.dataIndex]}: ${p.data.value}`,
    },
    grid: { top: 20, right: 60, bottom: 20, left: 20, containLabel: true },
    xAxis: {
      type: 'value',
      min: 0,
      max: 10,
      splitNumber: 5,
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: 'category',
      data: names,
      axisLabel: { fontSize: 13 },
      inverse: true,
    },
    series: [{
      type: 'bar',
      data: values,
      barMaxWidth: 48,
      label: {
        show: true,
        position: 'right',
        fontSize: 12,
        formatter: p => String(p.data.value),
      },
    }],
  }
}
