import { readFileSync } from 'fs';

let registered = false;
let files: string[] = [];
const Extensions: Record<string, any> = {};

function transform(opts: { extname: string; implementor: any }) {
  return (mod: any, filename: string) => {
    files.push(filename);
    let code = readFileSync(filename, 'utf-8');
    if (['.ts', '.tsx'].includes(opts.extname)) {
      code = opts.implementor.transformSync(code, {
        loader: opts.extname.slice(1),
        target: 'es2017',
        format: 'cjs',
      }).code;
    }
    mod._compile(code, filename);
  };
}

export function register(opts: { implementor: any }) {
  files = [];
  const types = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];
  if (!registered) {
    for (const type of types) {
      Extensions[type] = require.extensions[type];
      require.extensions[type] = transform({ ...opts, extname: type });
    }
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
  for (const type of Object.keys(Extensions)) {
    require.extensions[type] = Extensions[type];
  }
  registered = false;
}
