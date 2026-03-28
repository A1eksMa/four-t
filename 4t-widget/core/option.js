export const Some      = value => ({ tag: 'Some', value })
export const None      = ()    => ({ tag: 'None' })
export const map       = (opt, f) => opt.tag === 'Some' ? Some(f(opt.value)) : opt
export const flatMap   = (opt, f) => opt.tag === 'Some' ? f(opt.value)       : opt
export const getOrElse = (opt, def) => opt.tag === 'Some' ? opt.value : def
export const match     = patterns => opt => (patterns[opt.tag] ?? patterns['_'])(opt.value)
