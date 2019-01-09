export default function(jsonStr) {
  return jsonStr
    .replace(/\"component\": (\"(.+?)\")/g, (global, m1, m2) => {
      return `"component": ${m2.replace(/\^/g, '"')}`;
    })
    .replace(/\:\s\"(function[\s\S]+?})"/g, (global, m1) => {
      return `: ${m1}`;
    })
    .replace(/\"Routes\": (\"(.+?)\")/g, `"Routes": $2`)
    .replace(/\\r\\n/g, '\r\n')
    .replace(/\\n/g, '\r\n');
}
