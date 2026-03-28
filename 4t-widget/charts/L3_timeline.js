import { resolveField } from '../core/i18n.js'
import { periodToMs } from '../core/scale.js'
import { getToolsAtPeriod } from '../core/scale.js'

// buildL3Option(thread: ThreadData, zeroed: boolean, lang: string) => EChartsOption
export const buildL3Option = (thread, zeroed, lang) => {
  const scale   = thread.timeline_config.scale
  const points  = thread.timeline
  const xData   = points.map(p => periodToMs(scale, p.period))
  const yData   = zeroed ? points.map(() => 0) : points.map(p => p.level)

  const markPoints = zeroed ? [] : points
    .map((p, i) => p.annotation
      ? {
          coord: [xData[i], p.level],
          value: resolveField(p.annotation, lang),
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
            backgroundColor: '#fff',
            borderColor: '#ccc',
            borderWidth: 1,
            borderRadius: 3,
            padding: [3, 6],
            fontSize: 11,
            color: '#333',
          },
          symbol: 'none',
        }
      : null
    )
    .filter(Boolean)

  return {
    animation: true,
    tooltip: {
      trigger: 'axis',
      formatter: params => {
        const p = params[0]
        const point = points[p.dataIndex]
        const label = resolveField(point?.annotation, lang)
        return label ? `${p.axisValue}<br/>${p.marker}${p.value}${label ? `<br/><i>${label}</i>` : ''}` : `${p.marker}${p.value}`
      },
    },
    grid: { top: 40, right: 20, bottom: 80, left: 20, containLabel: true },
    xAxis: {
      type: 'time',
      axisLabel: { fontSize: 11 },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 10,
      splitNumber: 5,
      axisLabel: { fontSize: 11 },
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider',  start: 0, end: 100, height: 24, bottom: 10 },
    ],
    series: [
      {
        type: 'bar',
        data: xData.map((x, i) => [x, yData[i]]),
        barMaxWidth: 40,
        itemStyle: { opacity: 0.55 },
        markPoint: { data: markPoints },
      },
      {
        type: 'line',
        data: xData.map((x, i) => [x, yData[i]]),
        smooth: thread.timeline_config.interpolation === 'smooth',
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 6,
      },
    ],
  }
}
