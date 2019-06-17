import { readFileSync } from 'fs';
import { codeFrameColumns } from '@babel/code-frame';

function hasCodeFrame(stack) {
  return stack.includes('^') && stack.includes('>');
}

export default function({ stack, message }, options = {}) {
  const { codeFrame = {}, cwd } = options;
  if (hasCodeFrame(stack)) {
    return message;
  }

  const re = /at[^(]+\(([^:]+):(\d+):(\d+)\)/;
  const m = stack.match(re);
  if (m) {
    const [, file, line, column] = m;
    if (!file.startsWith('.') && !file.startsWith('/')) {
      return message;
    }
    const rawLines = readFileSync(file, 'utf-8');
    if (file.startsWith(cwd)) {
      return [
        `${file}: ${message} (${line}, ${column})`,
        codeFrameColumns(
          rawLines,
          {
            start: { line, column },
          },
          {
            highlightCode: true,
            ...codeFrame,
          },
        ),
      ].join('\n\n');
    } else {
      return message;
    }
  } else {
    return message;
  }
}
