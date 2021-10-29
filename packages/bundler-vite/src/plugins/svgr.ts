// @ts-ignore
import svgr from '@svgr/core';
import {
  transform,
  TransformOptions,
} from '@umijs/bundler-utils/compiled/esbuild';
import fs from 'fs';
import type { Plugin } from 'vite';

export default function svgrPlugin(svgOptions: TransformOptions): Plugin {
  return {
    name: 'bundler-vite:svgr',
    async transform(code, id) {
      if (id.endsWith('.svg')) {
        const svgFile = fs.readFileSync(id, 'utf8');
        const svgrCode = await svgr(
          svgFile,
          {},
          { componentName: 'ReactComponent' },
        );
        const componentCode = svgrCode.replace(
          'export default ReactComponent',
          'export { ReactComponent }',
        );

        const result = await transform(componentCode + '\n' + code, {
          loader: 'jsx',
          ...svgOptions,
        });

        return {
          code: result.code,
          map: result.map || null,
        };
      }
    },
  };
}
