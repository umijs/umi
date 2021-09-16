import assert from 'assert';
import { basename } from 'path';
import { Dep } from './dep';

export async function getExposeFromContent(opts: {
  dep: Dep;
  filePath: string;
  content: string;
}) {
  // Support CSS
  if (
    opts.filePath &&
    /\.(css|less|scss|sass|stylus|styl)$/.test(opts.filePath)
  ) {
    return `import '${opts.dep.file}';`;
  }

  // Support Assets Files
  if (
    opts.filePath &&
    /\.(json|svg|png|jpe?g|avif|gif|webp|ico|eot|woff|woff2|ttf|txt|text|mdx?)$/.test(
      opts.filePath,
    )
  ) {
    return `
import _ from '${opts.dep.file}';
export default _;`.trim();
  }

  assert(
    /(js|jsx|mjs|ts|tsx)$/.test(opts.filePath),
    `file type not supported for ${basename(opts.filePath)}.`,
  );

  return '';
}
