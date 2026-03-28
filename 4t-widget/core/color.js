export const hexToRgb = hex => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
})

export const rgba = (hex, a) => {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r},${g},${b},${a})`
}

// Blend color towards white: i=0 → full color, i=total-1 → lighter
export const shade = (hex, i, total) => {
  const factor = 1 - 0.35 * (i / Math.max(total - 1, 1))
  const { r, g, b } = hexToRgb(hex)
  return `rgb(${Math.round(r * factor + 255 * (1 - factor))},${Math.round(g * factor + 255 * (1 - factor))},${Math.round(b * factor + 255 * (1 - factor))})`
}
