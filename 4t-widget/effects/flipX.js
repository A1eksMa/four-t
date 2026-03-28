const HALF = 280

// Rotates the chart DOM around the Y axis (horizontal flip).
// (dom, callback, afterFlip) => void
export const flipX = (dom, callback, afterFlip) => {
  const pivotX = dom.offsetWidth / 2
  dom.style.transition = ''
  dom.style.transformOrigin = `${pivotX}px center`
  dom.style.perspective = '1400px'

  dom.style.transition = `transform ${HALF}ms ease-in`
  dom.style.transform  = 'rotateY(90deg)'

  setTimeout(() => {
    callback()
    dom.style.transition = `transform ${HALF}ms ease-out`
    dom.style.transform  = 'rotateY(0deg)'

    setTimeout(() => {
      dom.style.transition  = ''
      dom.style.transform   = ''
      dom.style.transformOrigin = ''
      if (afterFlip) afterFlip()
    }, HALF)
  }, HALF)
}
