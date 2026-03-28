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

export const applyEffect    = (name, dom, cb, after) =>
  getOrElse(Some(registry.get(name)), none)(dom, cb, after)

export const registerEffect = (name, fn) => registry.set(name, fn)

export const effectNames    = () => [...registry.keys()]
