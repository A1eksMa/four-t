import { getToolsAtPeriod } from '../core/scale.js'
import { getString } from '../core/i18n.js'

// buildL4Option(thread: ThreadData, periodMs: number, lang: string, locale: object) => EChartsOption
export const buildL4Option = (thread, periodMs, lang, locale = {}) => {
  const tools = getToolsAtPeriod(thread, periodMs)

  if (!tools.length) {
    return {
      graphic: [{
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          text: getString(locale, 'no_tools'),
          fontSize: 16,
          fill: '#999',
        },
      }],
      series: [],
    }
  }

  const cols = Math.ceil(Math.sqrt(tools.length))
  const rows = Math.ceil(tools.length / cols)

  const data = tools.map((tool, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    return {
      value: [col, rows - row - 1, tool.level],
      name:  tool.name,
    }
  })

  return {
    animation: true,
    tooltip: {
      formatter: p => `${p.data.name}: ${p.data.value[2]}`,
    },
    grid: { top: 20, right: 20, bottom: 20, left: 20 },
    xAxis: {
      type: 'value',
      min: -0.5,
      max: cols - 0.5,
      show: false,
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      min: -0.5,
      max: rows - 0.5,
      show: false,
      splitLine: { show: false },
    },
    series: [{
      type: 'scatter',
      data,
      symbolSize: val => Math.max(val[2] * 18, 36),
      label: {
        show: true,
        formatter: p => `${p.data.name}\n${p.data.value[2]}`,
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
      },
    }],
  }
}
