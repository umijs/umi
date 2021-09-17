import { readFileSync } from 'fs';

export function registerESBuild(opts: { implementor: any }) {
  require.extensions['.ts'] = (mod, filename) => {
    const ts = readFileSync(filename, 'utf-8');
    const { code } = opts.implementor.transformSync(ts, {
      loader: 'ts',
      target: 'es2017',
      format: 'cjs',
    });
    // @ts-ignore
    mod._compile(code, filename);
  };
}
