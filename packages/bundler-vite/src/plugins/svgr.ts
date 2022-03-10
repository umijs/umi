// @ts-ignore
import { transform as SVGTransform } from '@svgr/core';
import {
  transform,
  TransformOptions,
} from '@umijs/bundler-utils/compiled/esbuild';
import fs from 'fs';
import type { Plugin } from '../../compiled/vite';

type SVGROption = { [key: string]: any };
type SVGOOption = { [key: string]: any } | false;

/**
 * an universal tool to transform SVG into React components
 * @param svgr svgr options
 * @param svgo svgo options
 * @param transformOptions include transform options to translate svg ReactComponent
 */
export default function svgrPlugin(
  svgr: SVGROption = {},
  svgo: SVGOOption = {},
  transformOptions?: TransformOptions,
): Plugin {
  return {
    name: 'bundler-vite:svgr',
    async transform(code, id) {
      if (id.endsWith('.svg')) {
        let componentCode = code;
        if (svgr) {
          const svgFile = fs.readFileSync(id, 'utf8');
          const svgrCode = await SVGTransform(
            svgFile,
            {
              icon: true,
              svgoConfig: {
                ...(svgo || {}),
              },
              ...svgr,
              svgo: !!svgo,
            },
            { componentName: 'ReactComponent' },
          );
          componentCode =
            svgrCode.replace(
              'export default ReactComponent',
              'export { ReactComponent }',
            ) +
            '\n' +
            code;
        }

        const result = await transform(componentCode, {
          loader: 'jsx',
          sourcefile: id,
          sourcemap: true,
          ...transformOptions,
        });

        return {
          code: result.code,
          map: result.map || null,
        };
      }
    },
  };
}
