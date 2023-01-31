import type { Loader, Plugin } from '@umijs/bundler-utils/compiled/esbuild';
import fs from 'fs';
import { extractIcons } from '../extract';

export function esbuildCollectIconPlugin(opts: {
  icons: Set<string>;
  alias: Record<string, string>;
}): Plugin {
  return {
    name: 'esbuildCollectIconPlugin',
    setup(build) {
      const loaders: Loader[] = ['js', 'jsx', 'ts', 'tsx'];
      loaders.forEach((loader) => {
        const filter = new RegExp(`\\.(${loader})$`);
        build.onLoad({ filter }, (args) => {
          const contents = fs.readFileSync(args.path, 'utf-8');
          extractIcons(contents).forEach((icon) => {
            // just add
            // don't handle delete for dev
            opts.icons.add(opts.alias[icon] || icon);
          });
          return {
            contents,
            loader,
          };
        });
      });
    },
  };
}
