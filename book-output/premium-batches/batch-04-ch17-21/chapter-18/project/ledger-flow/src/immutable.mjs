export function updateIn(target, [key, ...rest], change) {
  const current = target?.[key];
  const next = rest.length === 0
    ? change(current)
    : updateIn(current, rest, change);
  if (Object.is(next, current)) {
    return target;
  }
  if (Array.isArray(target)) {
    return target.with(key, next);
  }
  return { ...target, [key]: next };
}

export const setIn = (target, path, value) => updateIn(target, path, () => value);

export function deepFreeze(value) {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}
