export const none = (_dom, callback, afterFlip) => {
  callback()
  if (afterFlip) afterFlip()
}
