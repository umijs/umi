import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';

// esbuild plugin for umi.server.js bundler to handle svg assets
function svgLoader(opts: { cwd: string }): esbuild.Plugin {
  opts;
  return {
    name: 'svg-loader',
    setup(build) {
      build.onResolve({ filter: /\.(svg)$/ }, (args) => {
        return {
          path: resolve(args.resolveDir, args.path),
          namespace: 'svgAssets',
        };
      });
      readFileSync;
      dirname;
      //       build.onLoad({ filter: /\.(svg)$/, namespace: 'svgAssets' }, (args) => {
      //         let url = webpackAssetsManifest.get(args.path);
      //         if (!url) {
      //           url = Buffer.from(readFileSync(args.path)).toString('base64');
      //         }
      //         // TODO: 可能可以删
      //         // TODO: 支持非 base64 的场景
      //         else {
      //           url = '/' + url;
      //         }
      //         return {
      //           contents: `
      // import React from 'react';
      // const url = "data:image/svg+xml;base64,${url}";
      // export default url;
      // export function ReactComponent() { return <img src="data:image/svg+xml;base64,${url}" alt="" /> }
      // `,
      //           resolveDir: dirname(args.path),
      //           loader: 'jsx',
      //         };
      //       });
    },
  };
}

export default svgLoader;
