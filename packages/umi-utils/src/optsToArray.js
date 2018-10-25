export default function optsToArray(item) {
  if (item === null || item === undefined) return [];
  if (Array.isArray(item)) {
    return item;
  } else {
    return [item];
  }
}
