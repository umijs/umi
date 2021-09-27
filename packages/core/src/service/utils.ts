export function isPromise(obj: any) {
  return (
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  );
}

export function makeArray(item: any) {
  return Array.isArray(item) ? item : [item];
}
