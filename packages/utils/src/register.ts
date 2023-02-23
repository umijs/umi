import { extname } from 'path';
import { addHook } from '../compiled/pirates';
import { logger } from './index';

const COMPILE_EXTS = ['.ts', '.tsx', '.js', '.jsx'];
const HOOK_EXTS = [...COMPILE_EXTS, '.mjs'];

let registered = false;
let files: string[] = [];
let revert: () => void = () => {};

function transform(opts: { code: string; filename: string; implementor: any }) {
  const { code, filename, implementor } = opts;
  files.push(filename);
  const ext = extname(filename);
  try {
    return implementor.transformSync(code, {
      sourcefile: filename,
      loader: ext.slice(1),
      // consistent with `tsconfig.base.json`
      // https://github.com/umijs/umi-next/pull/729
      target: 'es2019',
      format: 'cjs',
      logLevel: 'error',
    }).code;
  } catch (e) {
    logger.error(e);
    throw new Error(`Parse file failed: [${filename}]`);
  }
}

export function register(opts: { implementor: any; exts?: string[] }) {
  files = [];
  if (!registered) {
    revert = addHook(
      (code, filename) =>
        transform({ code, filename, implementor: opts.implementor }),
      {
        ext: opts.exts || HOOK_EXTS,
        ignoreNodeModules: true,
      },
    );
    registered = true;
  }
}

export function getFiles() {
  return files;
}

export function clearFiles() {
  files = [];
}

export function restore() {
  revert();
  registered = false;
}
