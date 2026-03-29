import { resolveField } from '../core/i18n.js'
import { rgba } from '../core/color.js'

// buildL1Option(tracks: TrackData[], lang: string, zeroed?: boolean) => EChartsOption
export const buildL1Option = (tracks, lang, zeroed = false) => {
  const names  = tracks.map(t => resolveField(t.name, lang))
  const values = tracks.map(t => {
    const style = t.status === 'placeholder'
      ? { opacity: 0.22 }
      : { color: t.color }
    return {
      value: zeroed ? 0 : (t.status === 'placeholder' ? 0.4 : t.level),
      itemStyle: style,
      ...(t.status === 'placeholder' && !zeroed ? { emphasis: { disabled: true } } : {}),
    }
  })

  return {
    animation: true,
    animationDuration: 600,
    animationEasing: 'cubicOut',
    animationDurationUpdate: 400,
    animationEasingUpdate: 'cubicIn',
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
