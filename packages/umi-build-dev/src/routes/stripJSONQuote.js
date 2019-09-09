export default function(jsonStr) {
  return jsonStr
    .replace(/\"(.+?)\": (\"(.+?)\")/g, (global, m1, m2, m3) => {
      try {
        // eslint-disable-next-line
        if (m1 !== 'component' && typeof eval(m3) === 'function') {
          return `"${m1}": ${m3.slice(1, -1)}`;
        }
      } catch {} //eslint-disable-line
      return `"${m1}": ${m2}`;
    })
    .replace(/\"component\": (\"(.+?)\")/g, (global, m1, m2) => {
      return `"component": ${m2.replace(/\^/g, '"')}`;
    })
    .replace(/\"Routes\": (\"(.+?)\")/g, `"Routes": $2`)
    .replace(/\\r\\n/g, '\r\n')
    .replace(/\\n/g, '\r\n');
}
