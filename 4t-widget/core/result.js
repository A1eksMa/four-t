export const Ok           = value => ({ tag: 'Ok',  value })
export const Err          = error => ({ tag: 'Err', error })
export const mapResult    = (r, f) => r.tag === 'Ok' ? Ok(f(r.value)) : r
export const flatMapResult = (r, f) => r.tag === 'Ok' ? f(r.value)    : r
