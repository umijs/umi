export default function(componentStr) {
  return /^\(.*?\)\s*?=>/.test(componentStr);
}
