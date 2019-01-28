const isWindows =
  typeof process !== 'undefined' && process.platform === 'win32';

export default function(content) {
  if (typeof content !== 'string') {
    return content;
  }
  return isWindows ? content.replace(/\r/g, '') : content;
}
