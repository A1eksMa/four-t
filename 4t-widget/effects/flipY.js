const HALF = 280

// Rotates the chart DOM around the X axis (vertical flip).
// (dom, callback, afterFlip) => void
export const flipY = (dom, callback, afterFlip) => {
  const pivotY = dom.offsetHeight / 2
  dom.style.transition = ''
  dom.style.transformOrigin = `center ${pivotY}px`
  dom.style.perspective = '1400px'

  dom.style.transition = `transform ${HALF}ms ease-in`
  dom.style.transform  = 'rotateX(90deg)'

  setTimeout(() => {
    callback()
    dom.style.transition = `transform ${HALF}ms ease-out`
    dom.style.transform  = 'rotateX(0deg)'

    setTimeout(() => {
      dom.style.transition  = ''
      dom.style.transform   = ''
      dom.style.transformOrigin = ''
      if (afterFlip) afterFlip()
    }, HALF)
  }, HALF)
}
