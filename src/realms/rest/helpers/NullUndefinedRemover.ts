export const removeNullUndefined = (obj) => {
  const entries = Object.entries(obj).filter(([, value]) => value != null)
  const clean = entries.map(([key, v]) => {
    const value =
      typeof v == "object" && !(v instanceof Date)
        ? v instanceof Array
          ? v.map((x) => removeNullUndefined(x))
          : removeNullUndefined(v)
        : v
    return [key, value]
  })
  return Object.fromEntries(clean)
}
