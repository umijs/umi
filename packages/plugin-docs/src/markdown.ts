export function parseTitle(opts: { content: string }) {
  const lines = opts.content
    .replace(/{[\n\s\t]*\/\*[\s\S]*?\*\/[\n\s\t]*}/g, '')
    .split('\n');
  let i = 0;
  const ret = [];
  while (i < lines.length) {
    const line = lines[i].trim();
    const match = line.match(/^(#+)\s+(.*)/);
    if (match) {
      ret.push({
        level: match[1].length,
        title: match[2],
      });
    }
    i += 1;
  }
  return ret;
}
