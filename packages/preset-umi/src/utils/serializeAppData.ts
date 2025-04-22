export function serializeAppData(data: any) {
  const cache = new WeakSet();
  return JSON.stringify(
    data,
    (_, value) => {
      if (value && typeof value === 'object') {
        if (cache.has(value)) return;
        cache.add(value);
      }
      return value;
    },
    2,
  );
}
