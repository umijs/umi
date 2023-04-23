import type { Plugin } from '@umijs/bundler-utils/compiled/esbuild';
import { logger } from '@umijs/utils';
import fs from 'fs';
import { extractIcons } from './extract';

const loaderMap = {
  js: 'tsx',
  jsx: 'tsx',
  tsx: 'tsx',
  ts: 'ts',
} as const;

export function esbuildIconPlugin(opts: {
  icons: Set<string>;
  alias: Record<string, string>;
}): Plugin {
  return {
    name: 'esbuildCollectIconPlugin',
    setup(build) {
      Object.keys(loaderMap).forEach((extName) => {
        const filter = new RegExp(`\\.(${extName})$`);
        build.onLoad({ filter }, async (args) => {
          const contents = await fs.promises.readFile(args.path, 'utf-8');
          const icons = extractIcons(contents);
          logger.debug(`[icons] ${args.path} > ${icons}`);
          icons.forEach((icon) => {
            // just add
            // don't handle delete for dev
            opts.icons.add(opts.alias[icon] || icon);
          });

          return {
            contents,
            loader: loaderMap[extName as keyof typeof loaderMap],
          };
        });
      });
    },
  };
}
