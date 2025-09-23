export function isEmail(v) {
  return /\S+@\S+\.\S+/.test(v)
}

export function minLength(v, n) {
  return v && v.length >= n
}
