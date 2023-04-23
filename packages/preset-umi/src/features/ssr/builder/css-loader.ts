import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { parcelCSS } from '@umijs/bundler-webpack/dist/parcelCSS';
import { winPath } from '@umijs/utils';
import { readFileSync } from 'fs';
import { dirname } from 'path';

export function ensureLastSlash(path: string) {
  return path.endsWith('/') ? path : path + '/';
}

export function hashString(str: string) {
  let hash = Buffer.from(str).toString('base64').replace(/=/g, '');
  hash = hash.substring(hash.length - 5);
  return hash;
}

export function getClassNames(code: Buffer, filename: string) {
  // why use Parcel CSS?
  // ref: https://github.com/indooorsman/esbuild-css-modules-plugin
  const { exports } = parcelCSS.transform({
    filename,
    code,
    minify: false,
    sourceMap: false,
    cssModules: {
      pattern: `[local]`,
      dashedIdents: false,
    },
  });
  return Object.keys(exports || {});
}

export function cssLoader(opts: { cwd: string }): esbuild.Plugin {
  return {
    name: 'css-loader',
    setup(build) {
      build.onLoad({ filter: /\.css$/ }, (args) => {
        const code = readFileSync(args.path);
        const filename = winPath(args.path).replace(
          ensureLastSlash(winPath(opts.cwd)),
          '',
        );
        const cssModuleObject = getClassNames(code, filename)
          .sort()
          .reduce<Record<string, string>>((memo, key) => {
            memo[key] = `${key}___${hashString(`${filename}@${key}`)}`;
            return memo;
          }, {});
        return {
          contents: `export default ${JSON.stringify(cssModuleObject)};`,
          loader: 'js',
          resolveDir: dirname(args.path),
        };
      });
    },
  };
}
