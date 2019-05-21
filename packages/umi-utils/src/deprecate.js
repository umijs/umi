const isWindows = typeof process !== 'undefined' && process.platform === 'win32';
const EOL = isWindows ? '\r\n' : '\n';

const hits = {};
export default function deprecate(methodName, ...args) {
  if (hits[methodName]) return;
  hits[methodName] = true;
  const stream = process.stderr;
  const color = stream.isTTY && '\x1b[31;1m';

  stream.write(EOL);
  if (color) {
    stream.write(color);
  }

  stream.write(`Warning: ${methodName} has been deprecated.`);
  stream.write(EOL);
  args.forEach(message => {
    stream.write(message);
    stream.write(EOL);
  });
  if (color) {
    stream.write('\x1b[0m');
  }
  stream.write(EOL);
  stream.write(EOL);
}
