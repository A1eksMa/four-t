import { resolveField } from '../core/i18n.js'
import { rgba } from '../core/color.js'

// buildL1Option(tracks: TrackData[], lang: string) => EChartsOption
export const buildL1Option = (tracks, lang) => {
  const names  = tracks.map(t => resolveField(t.name, lang))
  const values = tracks.map(t => t.status === 'placeholder'
    ? { value: 0.4, itemStyle: { opacity: 0.22 }, emphasis: { disabled: true } }
    : { value: t.level, itemStyle: { color: t.color } }
  )

  return {
    animation: true,
    tooltip: {
      trigger: 'item',
      formatter: p => p.data.value < 1
        ? resolveField(tracks[p.dataIndex].name, lang)
        : `${resolveField(tracks[p.dataIndex].name, lang)}: ${p.data.value}`,
    },
    grid: { top: 40, right: 20, bottom: 60, left: 20, containLabel: true },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: { interval: 0, rotate: 0, fontSize: 13 },
      axisTick: { alignWithLabel: true },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 10,
      splitNumber: 5,
      axisLabel: { fontSize: 11 },
    },
    series: [{
      type: 'bar',
      data: values,
      barMaxWidth: 80,
      label: {
        show: true,
        position: 'top',
        fontSize: 12,
        formatter: p => p.data.value < 1 ? '' : String(p.data.value),
      },
    }],
  }
}
