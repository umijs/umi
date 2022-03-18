import { extname } from 'path';
import { addHook } from '../compiled/pirates';

const COMPILE_EXTS = ['.ts', '.tsx', '.js', '.jsx'];
const HOOK_EXTS = [...COMPILE_EXTS, '.mjs'];

let registered = false;
let files: string[] = [];
let revert: () => void = () => {};

function transform(opts: { code: string; filename: string; implementor: any }) {
  const { code, filename, implementor } = opts;
  files.push(filename);
  const ext = extname(filename);
  return implementor.transformSync(code, {
    loader: ext.slice(1),
    target: 'es2017',
    format: 'cjs',
  }).code;
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
