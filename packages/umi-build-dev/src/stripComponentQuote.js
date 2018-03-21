export default function(jsonStr) {
  return jsonStr.replace(/\"component\": (\"(.+?)\")/g, `"component": $2`);
}
