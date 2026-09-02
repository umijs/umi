export function warnOnce(condition, message) {
  if (!condition) console.warn(message);
}
