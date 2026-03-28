# Stage 4: Effects

**Objective:** Extract transition effects from prototype into individual modules + registry
**Duration:** ~0.5 session
**Dependencies:** Stage 1 (option.js, getOrElse)

---

## Step 4.1: `effects/none.js`

**Action:** Implement no-op effect — used as default when no animation is configured

```js
// (dom, callback, afterFlip) => void
export const none = (_dom, callback, afterFlip) => {
  callback()
  if (afterFlip) afterFlip()
}
```

---

## Step 4.2: `effects/flipX.js`

**Action:** Extract `flipX` (rotateY around vertical axis) from prototype

Source in prototype: `function flipX(pivotX, cb, after)` calling `doFlip('Y', ...)`.

**Signature:** `(dom, callback, afterFlip) => void`

**Key implementation details from prototype:**
- `HALF = 280` ms per half-rotation
- `perspective: 1400px` must be set on wrapper element (not the chart DOM)
- Sequence: set `transformOrigin` → rotate out (ease-in) → swap content via callback → rotate in (ease-out) → clear styles → call afterFlip

**Parameter mapping from prototype to module signature:**
- `dom` = `chartDom` in prototype
- `callback` = content-swap function (was `cb` in prototype)
- `afterFlip` = post-animation function (was `after` in prototype)
- `pivotX` becomes `dom.offsetWidth / 2` (centre pivot) for back-navigation; for forward navigation it is passed from click event's `offsetX`

> To preserve the click-position pivot, the caller passes a wrapped effect via partial application or the effect accepts an optional `options` object. For MVP: use centre pivot always.

---

## Step 4.3: `effects/flipY.js`

**Action:** Extract `flipY` (rotateX around horizontal axis) from prototype

Same structure as `flipX` but uses `rotateX` and `transformOrigin = 'center {pivot}px'`.

---

## Step 4.4: `effects/grow.js`

**Action:** Extract `growL3` from prototype — animates L3 bars from zero to real values after flipY

**Signature:** `(chart, thread, lang) => void` — directly updates the ECharts instance

Unlike flipX/flipY, `grow` is not a DOM transform. It calls `chart.setOption` with animated real data after the flip completes. This effect is called as the `afterFlip` callback in the L2→L3 transition.

---

## Step 4.5: `effects/registry.js`

**Action:** Implement effect registry with `applyEffect` and `registerEffect`

```js
import { flipX } from './flipX.js'
import { flipY } from './flipY.js'
import { grow  } from './grow.js'
import { none  } from './none.js'
import { Some, getOrElse } from '../core/option.js'

const registry = new Map([
  ['flipX', flipX],
  ['flipY', flipY],
  ['grow',  grow],
  ['none',  none],
])

export const applyEffect = (name, dom, cb, after) =>
  getOrElse(Some(registry.get(name)), none)(dom, cb, after)

export const registerEffect = (name, fn) => registry.set(name, fn)

export const effectNames = () => [...registry.keys()]
```

---

## Definition of Done

- 5 files created in `4t-widget/effects/`
- `applyEffect('none', dom, cb)` calls `cb()` synchronously
- `applyEffect('flipX', dom, cb)` produces visible rotation in browser
- `applyEffect('unknown', dom, cb)` falls back to `none` (no error)
- `effectNames()` returns `['flipX', 'flipY', 'grow', 'none']`
