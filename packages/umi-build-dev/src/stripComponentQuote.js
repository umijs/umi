export default function(jsonStr) {
  return jsonStr
    .replace(/\"component\": (\"(.+?)\")/g, `"component": $2`)
    .replace(/\\r\\n/g, '\r\n')
    .replace(/\\n/g, '\r\n');
}
